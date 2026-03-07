import { ProductDialogI18n } from "./productDialogTypes";

export const PRODUCT_DIALOG_I18N: ProductDialogI18n = {
    delete: {
        en: {
            title: "Are you sure?",
            description: "This action cannot be undone. This will permanently delete the product.",
            actionText: "Delete",
            cancelText: "Cancel"
        },
        sr: {
            title: "Da li ste sigurni?",
            description: "Ova akcija se ne može poništiti. Ovo će trajno obrisati proizvod.",
            actionText: "Obriši",
            cancelText: "Otkaži"
        }
    },
    bulkDelete: {
        en: {
            title: "Delete Selected Products?",
            description: "Are you sure you want to delete selected products? This action cannot be undone.",
            actionText: "Yes, delete all",
            cancelText: "Cancel"
        },
        sr: {
            title: "Obrisati Selektovane Proizvode?",
            description: "Da li ste sigurni da želite da obrišete selektovane proizvode? Ova akcija se ne može poništiti.",
            actionText: "Da, obriši sve",
            cancelText: "Otkaži"
        }
    },
    bulkStatus: {
        en: {
            title: "Change Status?",
            description: "Update the status of selected products.",
            actionText: "Yes, change status",
            cancelText: "Cancel"
        },
        sr: {
            title: "Promeniti Status?",
            description: "Ažurirajte status selektovanih proizvoda.",
            actionText: "Da, promeni status",
            cancelText: "Otkaži"
        }
    },
    inlineStatus: {
        en: {
            title: "Change Status?",
            description: "Update product status.",
            actionText: "Yes, change",
            cancelText: "Cancel"
        },
        sr: {
            title: "Promeniti Status?",
            description: "Ažurirajte status proizvoda.",
            actionText: "Da, promeni",
            cancelText: "Otkaži"
        }
    },
    auctionRemoval: {
        en: {
            title: "Remove from Auction?",
            description: "The product will be removed from the auction. This action cannot be undone.",
            actionText: "Yes, remove and change",
            cancelText: "Cancel"
        },
        sr: {
            title: "Ukloniti sa Aukcije?",
            description: "Proizvod će biti uklonjen sa aukcije. Ova akcija se ne može poništiti.",
            actionText: "Da, ukloni i promeni",
            cancelText: "Otkaži"
        }
    },
    auctionDeleteWarning: {
        en: {
            title: "Cannot Delete",
            description: "This lot is currently on auction and cannot be deleted. Please change the status first, then delete it.",
            actionText: "Understood",
        },
        sr: {
            title: "Brisanje nije moguće",
            description: "Ovaj lot je trenutno na aukciji i ne može se obrisati. Promenite status lota pa ga onda obrišite.",
            actionText: "Razumem",
        }
    }
};
