import { CollectionDialogI18n } from "./collectionDialogTypes";

export const COLLECTION_DIALOG_I18N: CollectionDialogI18n = {
    delete: {
        en: {
            title: "Delete Collection?",
            description: "This action cannot be undone.",
            actionText: "Delete",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Obrisati Kolekciju?",
            description: "Ova akcija se ne može poništiti.",
            actionText: "Obriši",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    bulkDelete: {
        en: {
            title: "Delete Selected Collections?",
            description: "", // Dynamic
            actionText: "Yes, delete all",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Obrisati Selektovane Kolekcije?",
            description: "", // Dynamic
            actionText: "Da, obriši sve",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    bulkStatus: {
        en: {
            title: "Change Status?",
            description: "", // Dynamic
            actionText: "Yes, change status",
            cancelText: "Cancel",
        },
        sr: {
            title: "Promeniti Status?",
            description: "", // Dynamic
            actionText: "Da, promeni status",
            cancelText: "Otkaži",
        },
    },
    auctionDeleteWarning: {
        en: {
            title: "Cannot Delete",
            description: "This collection is currently on auction and cannot be deleted. Remove it from the auction first.",
            actionText: "OK",
        },
        sr: {
            title: "Nije Moguće Obrisati",
            description: "Ova kolekcija je trenutno na aukciji i ne može biti obrisana. Prvo je uklonite sa aukcije.",
            actionText: "OK",
        },
    },
    auctionRemoval: {
        en: {
            title: "Remove from Auction?",
            description: "", // Dynamic
            actionText: "Yes, remove and change",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Ukloniti sa Aukcije?",
            description: "", // Dynamic
            actionText: "Da, ukloni i promeni",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    inlineStatus: {
        en: {
            title: "Change Status?",
            description: "", // Dynamic
            actionText: "Yes, change",
            cancelText: "Cancel",
        },
        sr: {
            title: "Promeniti Status?",
            description: "", // Dynamic
            actionText: "Da, promeni",
            cancelText: "Otkaži",
        },
    },
};
