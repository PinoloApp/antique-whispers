import { useState, useEffect, useCallback, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { User, UserBidHistory, UserRole, UserStatus } from "@/types/adminUsers.types";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { BidService } from "@/services/bidService";
import { PaymentService } from "@/services/paymentService";
import { Bid, Payment, Auction } from "@/contexts/DataContext";
import { AuctionService } from "@/services/auctionService";

export const useAdminUsers = () => {
    const [rawUsers, setRawUsers] = useState<User[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { products, collections, collectionProducts } = useData();

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribeUsers = onSnapshot(q, (snapshot) => {
            const usersData: User[] = snapshot.docs.map(doc => {
                const data = doc.data();

                let firstName = data.firstName;
                let lastName = data.lastName;

                if (!firstName && data.name) {
                    const nameParts = data.name.split(" ");
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(" ") || "";
                }

                return {
                    id: doc.id,
                    ...data,
                    firstName: firstName || "Unknown",
                    lastName: lastName || "",
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastLoginAt: data.lastLoginAt?.toDate(),
                } as User;
            });
            setRawUsers(usersData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            toast({ title: "Error", description: "Failed to load users from database.", variant: "destructive" });
            setIsLoading(false);
        });

        const unsubscribeBids = BidService.subscribeToAllBidsAdmin(setBids);
        const unsubscribeAuctions = AuctionService.subscribeAll(setAuctions);

        return () => {
            unsubscribeUsers();
            unsubscribeBids();
            unsubscribeAuctions();
        };
    }, []);

    const users = useMemo(() => {
        const language = "sr"; // Default for admin calculation or could be dynamic
        return rawUsers.map(user => {
            // Match Profile.tsx filter precisely (only by userId)
            const userBids = bids.filter(b => (b as any).userId === user.id);
            
            // Replicate Profile.tsx bidHistory logic (Highest bid per unique Lot participation)
            const uniqueLots: Record<string, UserBidHistory> = {};

            [...userBids].sort((a, b) => b.maxAmount - a.maxAmount).forEach(bid => {
                const bidPid = String(bid.productId);
                const auctionIdVal = String(bid.auctionId);
                const key = `${auctionIdVal}-${bidPid}`;

                if (!uniqueLots[key]) {
                    const item = products.find(p => String(p.id) === bidPid) ||
                        collections.find(c => String(c.id) === bidPid) ||
                        collectionProducts.find(p => String(p.id) === bidPid);

                    const auction = auctions.find(a => String(a.id) === auctionIdVal);
                    
                    const snapEndDate = (bid as any).auctionEndDate;
                    const isAuctionCompleted = auction?.status === "completed" || 
                        (auction === undefined && snapEndDate && new Date() > (snapEndDate.toDate ? snapEndDate.toDate() : new Date(snapEndDate)));

                    const snapStatus = (bid as any).auctionStatus;
                    const effectiveStatus = auction?.status || snapStatus || "active";

                    let status: "won" | "lost" | "active" | "cancelled" | "paused" = "active";
                    
                    if (effectiveStatus === "cancelled") {
                        status = "cancelled";
                    } else if (effectiveStatus === "paused") {
                        status = "paused";
                    } else if (isAuctionCompleted || effectiveStatus === "completed") {
                        status = bid.isWinning ? "won" : "lost";
                    } else {
                        status = "active";
                    }

                    const itemName = item
                        ? (item as any).name?.sr || (item as any).namesr || (item as any).name?.en || (item as any).name || `Lot #${bid.productId}`
                        : `Lot #${bid.productId}`;

                    const itemImage = item ? (item as any).image || ((item as any).images?.[0]) : "/placeholder.svg";
                    const lotNumber = item ? ((item as any).lot || (item as any).lotNumber) : String(bid.productId);
                    const auctionName = auction?.title?.sr || auction?.title?.en || (bid as any).auctionTitle?.sr || (bid as any).auctionTitle?.en || (bid as any).auctionTitle || "Aukcija";
                    const auctionDate = auction?.endDate 
                        ? new Date(auction.endDate).toLocaleDateString() 
                        : (snapEndDate ? (snapEndDate.toDate ? snapEndDate.toDate().toLocaleDateString() : new Date(snapEndDate).toLocaleDateString()) : "N/A");

                    const itemType = collections.find(c => c.id === bid.productId) ? 'collection' : 'lot';

                    uniqueLots[key] = {
                        id: bid.id,
                        lotNumber: String(lotNumber),
                        lotName: itemName,
                        bidAmount: bid.maxAmount,
                        bidDate: bid.timestamp,
                        status,
                        auctionName: String(auctionName),
                        productId: bid.productId,
                        auctionId: bid.auctionId,
                        itemType,
                        image: itemImage,
                        auctionDate
                    };
                }
            });

            const bidHistory = Object.values(uniqueLots);
            
            return {
                ...user,
                totalBids: userBids.length,
                wonAuctions: bidHistory.filter(h => h.status === "won").length,
                bidHistory
            };
        });
    }, [rawUsers, bids, auctions, products, collections, collectionProducts]);

    const functions = getFunctions();

    const addUser = useCallback(async (newUser: User) => {
        try {
            const registerUser = httpsCallable(functions, "registerUser");
            const result = await registerUser({
                email: newUser.email,
                name: `${newUser.firstName} ${newUser.lastName}`,
                password: "DefaultPassword123!", // Initial password, should force reset or send link
            });
            // If the user should be admin, set the role after creation
            if (newUser.role === "admin") {
                const uid = (result.data as any)?.uid;
                if (uid) {
                    const setUserRole = httpsCallable(functions, "setUserRole");
                    await setUserRole({ uid, role: "admin" });
                }
            }
        } catch (error: any) {
            console.error("Error creating user:", error);
            throw error;
        }
    }, [functions]);

    const updateUser = useCallback(async (updatedUser: User) => {
        try {
            const adminUpdateUser = httpsCallable(functions, "adminUpdateUser");
            await adminUpdateUser({
                uid: updatedUser.id,
                data: {
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone || null,
                }
            });
        } catch (error: any) {
            console.error("Error updating user:", error);
            throw error;
        }
    }, [functions]);

    const deleteUser = useCallback(async (userId: string) => {
        try {
            const adminDeleteUser = httpsCallable(functions, "adminDeleteUser");
            await adminDeleteUser({ uid: userId });
        } catch (error: any) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }, [functions]);

    const changeUserStatus = useCallback(async (userId: string, newStatus: UserStatus) => {
        try {
            const adminUpdateUser = httpsCallable(functions, "adminUpdateUser");
            await adminUpdateUser({ uid: userId, data: { status: newStatus } });
        } catch (error: any) {
            console.error("Error changing status:", error);
            throw error;
        }
    }, [functions]);

    const changeUserRole = useCallback(async (userId: string, newRole: UserRole) => {
        try {
            const setUserRole = httpsCallable(functions, "setUserRole");
            await setUserRole({ uid: userId, role: newRole });
        } catch (error: any) {
            console.error("Error changing role:", error);
            throw error;
        }
    }, [functions]);

    const getAdminCount = useCallback(() => {
        return users.filter((u) => u.role === "admin").length;
    }, [users]);

    return {
        users,
        addUser,
        updateUser,
        deleteUser,
        changeUserStatus,
        changeUserRole,
        getAdminCount,
        isLoading
    };
};

