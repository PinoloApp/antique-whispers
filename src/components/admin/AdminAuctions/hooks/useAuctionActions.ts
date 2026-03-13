import { useState } from "react";
import { Auction, useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { useAuctionForm } from "./useAuctionForm";
import { AuctionService } from "@/services/auctionService";
import { PaymentService } from "@/services/paymentService";
import { CollectionProductService } from "@/services/collectionProductService";
import { NotificationService } from "@/services/notificationService";
import { UserService } from "@/services/userService";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase/firebase";

interface UseAuctionActionsProps {
    language: "en" | "sr";
    auctions: Auction[];
    updateProduct: (id: number, data: any) => void;
    updateCollection: (id: number, data: any) => void;
    addBid: (bid: any) => void;
    getProductBids: (id: number, auctionId: number) => any[];
    collections: any[];
    products: any[];
    categories: any[];
    onSuccess?: () => void;
}

export const useAuctionActions = ({
    language,
    auctions,
    updateProduct,
    updateCollection,
    addBid,
    getProductBids,
    collections,
    products,
    categories,
    onSuccess,
}: UseAuctionActionsProps) => {
    const { toast } = useToast();

    const [isMutating, setIsMutating] = useState(false);
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const openDialog = (type: string) => setActiveDialog(type);
    const closeDialog = () => setActiveDialog(null);

    const [auctionToActivate, setAuctionToActivate] = useState<number | null>(null);
    const [auctionToClose, setAuctionToClose] = useState<number | null>(null);
    const [auctionToDelete, setAuctionToDelete] = useState<number | null>(null);
    const [auctionToPause, setAuctionToPause] = useState<number | null>(null);
    const [auctionToCancel, setAuctionToCancel] = useState<number | null>(null);
    const [auctionToResume, setAuctionToResume] = useState<number | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [pendingAuctionData, setPendingAuctionData] = useState<Auction | null>(null);

    // Add Bid Dialog state
    const [addBidLotId, setAddBidLotId] = useState<number | null>(null);
    const [addBidAuctionId, setAddBidAuctionId] = useState<number | null>(null);
    const [addBidFormData, setAddBidFormData] = useState({
        bidderName: "",
        bidderEmail: "",
        amount: "",
    });

    // Cloud Tasks scheduling helpers
    const scheduleAuctionTasks = async (auctionId: number, startDate: Date, endDate: Date) => {
        try {
            const fn = httpsCallable(functions, "scheduleAuctionTasks");
            await fn({ auctionId, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() });
        } catch (error) {
            console.error("Failed to schedule auction tasks:", error);
        }
    };

    const cancelAuctionTasks = async (auctionId: number, cancelActivation = true, cancelCompletion = true) => {
        try {
            const fn = httpsCallable(functions, "cancelAuctionTasks");
            await fn({ auctionId, cancelActivation, cancelCompletion });
        } catch (error) {
            console.error("Failed to cancel auction tasks:", error);
        }
    };

    const handleUpdateConfirm = async (editingAuction: Auction | null, closeForm: () => void, resetForm: () => void) => {
        closeDialog();
        if (pendingAuctionData && editingAuction) {
            setIsMutating(true);
            try {
                // Update products that were removed from this auction
                const previousLotIds = editingAuction.lotIds || [];
                const removedLotIds = previousLotIds.filter((id) => !pendingAuctionData.lotIds?.includes(id));
                for (const productId of removedLotIds) {
                    const product = products.find(p => p.id === productId);
                    updateProduct(productId, {
                        auctionId: 0,
                        status: "withdrawn",
                        currentBid: product?.startingPrice || 0,
                        hasBids: false,
                        lot: ""
                    });

                    // Notify interested users
                    const interestedUserIds = await UserService.getInterestedUsers(productId);
                    for (const userId of interestedUserIds) {
                        await NotificationService.addNotification({
                            userId,
                            type: "info",
                            title: "Lot povučen",
                            titleEn: "Lot Withdrawn",
                            description: `Lot '${product?.name || productId}' na kojem ste imali ponudu ili koji vam je bio u favoritima je povučen sa aukcije.`,
                            descriptionEn: `Lot '${product?.name || productId}' that you bid on or had in favorites has been withdrawn from the auction.`,
                            timestamp: new Date(),
                            read: false,
                            productId: productId
                        });
                    }
                }

                // Update collections that were removed from this auction
                const previousCollectionIds = editingAuction.collectionIds || [];
                const removedCollectionIds = previousCollectionIds.filter((id) => !pendingAuctionData.collectionIds?.includes(id));
                // Use a standard for loop to await CollectionProductService.update properly
                for (const colId of removedCollectionIds) {
                    const collection = collections.find(c => c.id === colId);
                    updateCollection(colId, {
                        status: "withdrawn",
                        auctionId: 0,
                        currentBid: collection?.startingPrice || 0,
                        hasBids: false,
                        lotNumber: ""
                    });

                    if (collection && collection.productIds) {
                        for (const pid of collection.productIds) {
                            await CollectionProductService.update(pid, { lot: "", catalogMark: "" });
                        }
                    }

                    // Notify interested users
                    const interestedUserIds = await UserService.getInterestedUsers(colId, true);
                    for (const userId of interestedUserIds) {
                        await NotificationService.addNotification({
                            userId,
                            type: "info",
                            title: "Lot povučen",
                            titleEn: "Lot Withdrawn",
                            description: `Lot '${collection?.name[language] || colId}' na kojem ste imali ponudu ili koji vam je bio u favoritima je povučen sa aukcije.`,
                            descriptionEn: `Lot '${collection?.name.en || colId}' that you bid on or had in favorites has been withdrawn from the auction.`,
                            timestamp: new Date(),
                            read: false,
                            productId: colId
                        });
                    }
                }
                // --- Assign lot numbers to currently selected items ---
                const selectedProducts = products.filter(p => pendingAuctionData.lotIds?.includes(p.id));
                const selectedCollections = collections.filter(c => pendingAuctionData.collectionIds?.includes(c.id));

                const currentLotIds = new Set(editingAuction.lotIds || []);
                const currentColIds = new Set(editingAuction.collectionIds || []);

                // 1. Identify existing items (already in the auction)
                const existingItems = [
                    ...selectedProducts.filter(p => currentLotIds.has(p.id)).map(p => ({ 
                        type: 'product' as const, id: p.id, lot: parseInt(p.lot || "0", 10) 
                    })),
                    ...selectedCollections.filter(c => currentColIds.has(c.id)).map(c => ({ 
                        type: 'collection' as const, id: c.id, lot: parseInt(c.lotNumber || "0", 10) 
                    }))
                ];

                // 2. Identify new items (newly added to the auction)
                const newItems = [
                    ...selectedProducts.filter(p => !currentLotIds.has(p.id)).map(p => ({ 
                        type: 'product' as const, id: p.id, category: p.category, productIds: [] as number[] 
                    })),
                    ...selectedCollections.filter(c => !currentColIds.has(c.id)).map(c => ({ 
                        type: 'collection' as const, id: c.id, category: c.category, productIds: c.productIds || [] 
                    }))
                ];

                // 3. Keep existing items' lot numbers as they are
                for (const product of selectedProducts.filter(p => currentLotIds.has(p.id))) {
                    updateProduct(product.id, { auctionId: pendingAuctionData.id, status: "on_auction" });
                }
                for (const col of selectedCollections.filter(c => currentColIds.has(c.id))) {
                    updateCollection(col.id, { status: "on_auction", auctionId: pendingAuctionData.id });
                }

                // 4. Assign new lot numbers to new items starting from maxLot + 1
                if (newItems.length > 0) {
                    const maxLot = existingItems.length > 0 
                        ? Math.max(...existingItems.map(i => i.lot), 0)
                        : 0;

                    const getCategoryIndex = (catId: string) => {
                        const idx = categories.findIndex(c => c.id === catId);
                        return idx === -1 ? 99999 : idx; // Unknown categories go last
                    };

                    // Sort new items by category for logical grouping within the new batch
                    newItems.sort((a, b) => getCategoryIndex(a.category) - getCategoryIndex(b.category));

                    let nextLotNumber = maxLot + 1;
                    for (const item of newItems) {
                        const lotString = nextLotNumber.toString();
                        if (item.type === 'product') {
                            updateProduct(item.id, { auctionId: pendingAuctionData.id, status: "on_auction", lot: lotString });
                        } else if (item.type === 'collection') {
                            updateCollection(item.id, { status: "on_auction", auctionId: pendingAuctionData.id, lotNumber: lotString });
                            if (item.productIds && Array.isArray(item.productIds)) {
                                for (let i = 0; i < item.productIds.length; i++) {
                                    await CollectionProductService.update(item.productIds[i], {
                                        lot: lotString,
                                        catalogMark: `${lotString}-${i + 1}`
                                    });
                                }
                            }
                        }
                        nextLotNumber++;
                    }
                }

                await AuctionService.update(editingAuction.id, pendingAuctionData);

                // Reschedule Cloud Tasks if dates changed
                const datesChanged =
                    new Date(pendingAuctionData.startDate).getTime() !== new Date(editingAuction.startDate).getTime() ||
                    new Date(pendingAuctionData.endDate).getTime() !== new Date(editingAuction.endDate).getTime();

                if (datesChanged && pendingAuctionData.startDate && pendingAuctionData.endDate) {
                    await cancelAuctionTasks(editingAuction.id);
                    await scheduleAuctionTasks(editingAuction.id, pendingAuctionData.startDate, pendingAuctionData.endDate);
                }

                toast({
                    title: language === "en" ? "Auction Updated" : "Aukcija Ažurirana",
                    description: language === "en" ? "The auction has been updated successfully." : "Aukcija je uspešno ažurirana.",
                });
                onSuccess?.();
                closeForm();
                resetForm();
            } finally {
                setIsMutating(false);
            }
        }
        setUpdateDialogOpen(false);
        setPendingAuctionData(null);
    };

    const handleCreateConfirm = async (closeForm: () => void, resetForm: () => void) => {
        closeDialog();
        if (pendingAuctionData) {
            setIsMutating(true);
            try {
                // --- Assign lot numbers to currently selected items sorted by Category ---
                const selectedProducts = products.filter(p => pendingAuctionData.lotIds?.includes(p.id));
                const selectedCollections = collections.filter(c => pendingAuctionData.collectionIds?.includes(c.id));

                const itemsToAssign = [
                    ...selectedProducts.map(p => ({ type: 'product' as const, id: p.id, category: p.category, productIds: [] as number[] })),
                    ...selectedCollections.map(c => ({ type: 'collection' as const, id: c.id, category: c.category, productIds: c.productIds || [] }))
                ];

                const getCategoryIndex = (catId: string) => {
                    const idx = categories.findIndex(c => c.id === catId);
                    return idx === -1 ? 99999 : idx; // Unknown categories go last
                };

                itemsToAssign.sort((a, b) => getCategoryIndex(a.category) - getCategoryIndex(b.category));

                let currentLotNumber = 1;

                for (const item of itemsToAssign) {
                    const lotString = currentLotNumber.toString();
                    if (item.type === 'product') {
                        updateProduct(item.id, { auctionId: pendingAuctionData.id, status: "on_auction", lot: lotString });
                    } else if (item.type === 'collection') {
                        updateCollection(item.id, { status: "on_auction", auctionId: pendingAuctionData.id, lotNumber: lotString });
                        if (item.productIds && Array.isArray(item.productIds)) {
                            for (let i = 0; i < item.productIds.length; i++) {
                                await CollectionProductService.update(item.productIds[i], {
                                    lot: lotString,
                                    catalogMark: `${lotString}-${i + 1}`
                                });
                            }
                        }
                    }
                    currentLotNumber++;
                }

                await AuctionService.create(pendingAuctionData);

                // Schedule automatic activation & completion via Cloud Tasks
                if (pendingAuctionData.startDate && pendingAuctionData.endDate) {
                    await scheduleAuctionTasks(pendingAuctionData.id, pendingAuctionData.startDate, pendingAuctionData.endDate);
                }

                toast({
                    title: language === "en" ? "Auction Created" : "Aukcija Kreirana",
                    description: language === "en" ? "The auction has been created successfully." : "Aukcija je uspešno kreirana.",
                });
                onSuccess?.();
                closeForm();
                resetForm();
            } finally {
                setIsMutating(false);
            }
        }
        closeDialog();
        setPendingAuctionData(null);
    };

    const handleDeleteClick = (id: number) => {
        const auction = auctions.find(a => a.id === id);
        if (auction?.status === "active" || auction?.status === "upcoming") {
            toast({
                title: language === "en" ? "Cannot Delete" : "Nije moguće obrisati",
                description: language === "en"
                    ? "Active or upcoming auctions cannot be deleted. Please pause or cancel the auction first."
                    : "Aktivne ili predstojeće aukcije se ne mogu obrisati. Molimo vas da prvo pauzirate ili otkažete aukciju.",
                variant: "destructive",
            });
            return;
        }
        setAuctionToDelete(id);
        openDialog("delete");
    };

    const handleDeleteConfirm = () => {
        if (isMutating) return;
        openDialog("deleteSecond");
    };

    const handleDeleteFinalConfirm = async () => {
        if (auctionToDelete) {
            setIsMutating(true);
            try {
                const auction = auctions.find((a) => a.id === auctionToDelete);
                if (auction) {
                    if (auction.status !== "completed") {
                        auction.lotIds?.forEach((lotId) => {
                            const product = products.find(p => p.id === lotId);
                            updateProduct(lotId, {
                                status: "available",
                                auctionId: 0,
                                currentBid: product?.startingPrice || 0,
                                hasBids: false
                            });
                        });
                        auction.collectionIds?.forEach((colId) => {
                            const collection = collections.find(c => c.id === colId);
                            updateCollection(colId, {
                                status: "available",
                                auctionId: 0,
                                currentBid: collection?.startingPrice || 0,
                                hasBids: false
                            });
                        });
                    }
                }
                await cancelAuctionTasks(auctionToDelete);
                await AuctionService.delete(auctionToDelete);
                toast({
                    title: language === "en" ? "Auction Deleted" : "Aukcija Obrisana",
                    description: language === "en" ? "The auction has been deleted." : "Aukcija je obrisana.",
                });
                onSuccess?.();
                closeDialog();
                setAuctionToDelete(null);
            } finally {
                setIsMutating(false);
            }
        }
    };

    const getDeleteSecondAlertText = () => {
        const auction = auctions.find((a) => a.id === auctionToDelete);
        if (!auction) return { title: "", description: "" };
        const status = auction.status;
        if (status === "active") {
            return {
                title: language === "en" ? "This auction is currently ACTIVE!" : "Ova aukcija je trenutno AKTIVNA!",
                description:
                    language === "en"
                        ? "This auction is live and may have active bidders. Deleting it will remove all associated bids and data permanently. Are you absolutely sure?"
                        : "Ova aukcija je uživo i može imati aktivne ponuđače. Brisanjem ćete trajno ukloniti sve povezane ponude i podatke. Da li ste apsolutno sigurni?",
            };
        }
        if (status === "upcoming") {
            return {
                title:
                    language === "en" ? "This auction is scheduled as UPCOMING!" : "Ova aukcija je zakazana kao PREDSTOJEĆA!",
                description:
                    language === "en"
                        ? "This auction is scheduled to start soon. Deleting it will remove all prepared lots and data permanently. Are you absolutely sure?"
                        : "Ova aukcija je zakazana za uskoro. Brisanjem ćete trajno ukloniti sve pripremljene lotove i podatke. Da li ste apsolutno sigurni?",
            };
        }
        if (status === "paused") {
            return {
                title: language === "en" ? "This auction is currently PAUSED!" : "Ova aukcija je trenutno PAUZIRANA!",
                description:
                    language === "en"
                        ? "This auction is paused and can be resumed. Deleting it will remove all associated bids and data permanently. Are you absolutely sure?"
                        : "Ova aukcija je pauzirana i može biti nastavljena. Brisanjem ćete trajno ukloniti sve povezane ponude i podatke. Da li ste apsolutno sigurni?",
            };
        }
        if (status === "cancelled") {
            return {
                title: language === "en" ? "This auction was CANCELLED" : "Ova aukcija je OTKAZANA",
                description:
                    language === "en"
                        ? "This auction was cancelled. Deleting it will permanently remove all historical data. Are you absolutely sure?"
                        : "Ova aukcija je otkazana. Brisanjem ćete trajno ukloniti sve istorijske podatke. Da li ste apsolutno sigurni?",
            };
        }
        return {
            title: language === "en" ? "This auction is COMPLETED" : "Ova aukcija je ZAVRŠENA",
            description:
                language === "en"
                    ? "This auction has ended. Deleting it will permanently remove all bid history and results. Are you absolutely sure?"
                    : "Ova aukcija je završena. Brisanjem ćete trajno ukloniti svu istoriju ponuda i rezultate. Da li ste apsolutno sigurni?",
        };
    };

    const handleActivateClick = (id: number) => {
        setAuctionToActivate(id);
        openDialog("activate");
    };

    const handleActivateConfirm = async () => {
        if (auctionToActivate) {
            setIsMutating(true);
            try {
                const auction = auctions.find((a) => a.id === auctionToActivate);
                if (auction) {
                    // Cancel only the activation task; keep the completion task
                    await cancelAuctionTasks(auctionToActivate, true, false);
                    await AuctionService.update(auctionToActivate, { status: "active" as any });
                    toast({
                        title: language === "en" ? "Auction Activated" : "Aukcija Aktivirana",
                        description: language === "en" ? "The auction is now active." : "Aukcija je sada aktivna.",
                    });
                    onSuccess?.();
                }
                closeDialog();
                setAuctionToActivate(null);
            } finally {
                setIsMutating(false);
            }
        }
    };

    const handleCloseClick = (id: number) => {
        setAuctionToClose(id);
        openDialog("close");
    };

    const handleCloseConfirm = async () => {
        if (auctionToClose) {
            setIsMutating(true);
            try {
                const auction = auctions.find((a) => a.id === auctionToClose);
                if (auction) {
                    // Cancel the completion task since we're closing manually
                    await cancelAuctionTasks(auctionToClose, false, true);

                    const wonDate = new Date().toISOString().split('T')[0];
                    const deadlineDate = new Date();
                    deadlineDate.setDate(deadlineDate.getDate() + 7);
                    const paymentDeadline = deadlineDate.toISOString().split('T')[0];

                    // Process Collections
                    if (auction.collectionIds) {
                        for (const colId of auction.collectionIds) {
                            const collection = collections.find((c) => c.id === colId);
                            if (collection) {
                                const colBids = getProductBids(colId, auction.id);
                                const winningBid = colBids.find(b => b.isWinning);

                                if (winningBid) {
                                    updateCollection(colId, { status: "sold" });
                                    
                                    // Create Payment for Collection
                                    await PaymentService.create({
                                        itemId: colId,
                                        itemType: 'collection',
                                        lotNumber: collection.lotNumber || `Coll #${colId}`,
                                        lotName: collection.name,
                                        auctionTitle: auction.title,
                                        buyerName: winningBid.bidderName,
                                        buyerEmail: winningBid.bidderEmail,
                                        amount: winningBid.currentAmount,
                                        status: 'pending',
                                        wonDate,
                                        paymentDeadline
                                    });
                                } else {
                                    updateCollection(colId, { status: "available", auctionId: 0 });
                                }
                            }
                        }
                    }

                    // Process Products
                    if (auction.lotIds) {
                        for (const lotId of auction.lotIds) {
                            const product = products.find(p => p.id === lotId);
                            const lotBids = getProductBids(lotId, auction.id);
                            const winningBid = lotBids.find(b => b.isWinning);

                            if (winningBid && product) {
                                updateProduct(lotId, { status: "sold" });

                                // Create Payment for Product
                                await PaymentService.create({
                                    itemId: lotId,
                                    itemType: 'product',
                                    lotNumber: product.lot || `Lot #${lotId}`,
                                    lotName: { en: product.name, sr: product.namesr },
                                    auctionTitle: auction.title,
                                    buyerName: winningBid.bidderName,
                                    buyerEmail: winningBid.bidderEmail,
                                    amount: winningBid.currentAmount,
                                    status: 'pending',
                                    wonDate,
                                    paymentDeadline
                                });
                            } else {
                                updateProduct(lotId, { status: "available", auctionId: 0 });
                            }
                        }
                    }

                    await AuctionService.update(auctionToClose, { status: "completed" });
                    toast({
                        title: language === "en" ? "Auction Closed" : "Aukcija Zatvorena",
                        description: language === "en" ? "The auction has been closed and winner payments have been generated." : "Aukcija je zatvorena i plaćanja za pobednike su generisana.",
                    });
                    onSuccess?.();
                }
                closeDialog();
                setAuctionToClose(null);
            } finally {
                setIsMutating(false);
            }
        }
    };

    const handlePauseClick = (id: number) => {
        setAuctionToPause(id);
        openDialog("pause");
    };

    const handlePauseConfirm = async () => {
        if (auctionToPause) {
            setIsMutating(true);
            try {
                const auction = auctions.find((a) => a.id === auctionToPause);
                if (auction) {
                    // Cancel completion task — paused auction shouldn't auto-complete
                    await cancelAuctionTasks(auctionToPause, false, true);
                    await AuctionService.update(auctionToPause, { status: "paused" });
                    toast({
                        title: language === "en" ? "Auction Paused" : "Aukcija Pauzirana",
                        description: language === "en" ? "The auction has been paused." : "Aukcija je pauzirana.",
                    });
                    onSuccess?.();
                }
                closeDialog();
                setAuctionToPause(null);
            } finally {
                setIsMutating(false);
            }
        }
    };

    const handleCancelClick = (id: number) => {
        setAuctionToCancel(id);
        openDialog("cancel");
    };

    const handleCancelConfirm = async () => {
        if (auctionToCancel) {
            setIsMutating(true);
            try {
                const auction = auctions.find((a) => a.id === auctionToCancel);
                if (auction) {
                    // Cancel all scheduled tasks
                    await cancelAuctionTasks(auctionToCancel);

                    auction.lotIds?.forEach((lotId) => {
                        const product = products.find(p => p.id === lotId);
                        updateProduct(lotId, {
                            status: "available",
                            auctionId: 0,
                            currentBid: product?.startingPrice || 0,
                            hasBids: false
                        });
                    });
                    auction.collectionIds?.forEach((colId) => {
                        const collection = collections.find(c => c.id === colId);
                        updateCollection(colId, {
                            status: "available",
                            auctionId: 0,
                            currentBid: collection?.startingPrice || 0,
                            hasBids: false
                        });
                    });
                    await AuctionService.update(auctionToCancel, { status: "cancelled" });
                    toast({
                        title: language === "en" ? "Auction Cancelled" : "Aukcija Otkazana",
                        description: language === "en" ? "The auction has been cancelled." : "Aukcija je otkazana.",
                    });
                    onSuccess?.();
                }
                closeDialog();
                setAuctionToCancel(null);
            } finally {
                setIsMutating(false);
            }
        }
    };

    const handleResumeClick = (id: number) => {
        setAuctionToResume(id);
        openDialog("resume");
    };

    const handleResumeConfirm = async () => {
        if (auctionToResume) {
            setIsMutating(true);
            try {
                const auction = auctions.find((a) => a.id === auctionToResume);
                if (auction) {
                    await AuctionService.update(auctionToResume, { status: "active" });

                    // Reschedule completion task for resumed auction
                    if (auction.endDate && new Date(auction.endDate) > new Date()) {
                        await scheduleAuctionTasks(auctionToResume, new Date(), auction.endDate);
                    }

                    toast({
                        title: language === "en" ? "Auction Resumed" : "Aukcija Nastavljena",
                        description: language === "en" ? "The auction has been resumed." : "Aukcija je nastavljena.",
                    });
                    onSuccess?.();
                }
                closeDialog();
                setAuctionToResume(null);
            } finally {
                setIsMutating(false);
            }
        }
    };


    const handleOpenAddBidDialog = (lotId: number, auctionId: number) => {
        const auction = auctions.find((a) => a.id === auctionId);
        if (!auction || auction.status !== "active") {
            toast({
                title: language === "en" ? "Auction Not Active" : "Aukcija Nije Aktivna",
                description:
                    language === "en"
                        ? "Live bids can only be added to active auctions."
                        : "Live ponude mogu se dodati samo na aktivne aukcije.",
                variant: "destructive",
            });
            return;
        }
        setAddBidLotId(lotId);
        setAddBidAuctionId(auctionId);
        setAddBidFormData({ bidderName: "", bidderEmail: "", amount: "" });
        openDialog("addBid");
    };

    const handleAddLiveBidClick = () => {
        if (!addBidLotId) return;

        const amount = parseFloat(addBidFormData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: language === "en" ? "Invalid Amount" : "Nevažeći Iznos",
                description: language === "en" ? "Please enter a valid bid amount." : "Molimo unesite validan iznos ponude.",
                variant: "destructive",
            });
            return;
        }

        if (!addBidFormData.bidderName.trim()) {
            toast({
                title: language === "en" ? "Name Required" : "Ime Obavezno",
                description: language === "en" ? "Please enter the bidder's name." : "Molimo unesite ime ponuđača.",
                variant: "destructive",
            });
            return;
        }

        const email = addBidFormData.bidderEmail.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast({
                title: language === "en" ? "Invalid Email" : "Nevažeći E-mail",
                description:
                    language === "en" ? "Please enter a valid email address." : "Molimo unesite validnu e-mail adresu.",
                variant: "destructive",
            });
            return;
        }

        openDialog("confirmAddBid");
    };

    const handleConfirmAddLiveBid = async () => {
        if (!addBidLotId || !addBidAuctionId) return;
        setIsMutating(true);
        const amount = parseFloat(addBidFormData.amount);

        try {
            await addBid({
                productId: addBidLotId,
                auctionId: addBidAuctionId,
                maxAmount: amount,
                bidderName: addBidFormData.bidderName.trim(),
                bidderEmail: addBidFormData.bidderEmail.trim() || "live@auction.com",
                isLiveAuction: true,
            });

            toast({
                title: language === "en" ? "Bid Added" : "Ponuda Dodata",
                description:
                    language === "en"
                        ? `Live auction bid of €${amount.toLocaleString()} added successfully.`
                        : `Ponuda sa live aukcije od €${amount.toLocaleString()} uspešno dodata.`,
            });
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: language === "en" ? "Error Adding Bid" : "Greška pri dodavanju ponude",
                description: error.message || (language === "en" ? "Failed to add live bid." : "Neuspešno dodavanje live ponude."),
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }

        closeDialog();
        setAddBidLotId(null);
        setAddBidAuctionId(null);
    };

    return {
        activeDialog,
        openDialog,
        closeDialog,
        handleActivateClick,
        handleActivateConfirm,
        handleCloseClick,
        handleCloseConfirm,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteFinalConfirm,
        getDeleteSecondAlertText,
        handlePauseClick,
        handlePauseConfirm,
        handleCancelClick,
        handleCancelConfirm,
        handleResumeClick,
        handleResumeConfirm,
        handleCreateConfirm,
        handleUpdateConfirm,
        addBidFormData,
        setAddBidFormData,
        handleOpenAddBidDialog,
        handleAddLiveBidClick,
        handleConfirmAddLiveBid,
        pendingAuctionData,
        setPendingAuctionData,
        isMutating,
    };
};
