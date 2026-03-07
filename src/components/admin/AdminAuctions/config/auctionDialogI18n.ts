import { DialogI18n } from "./auctionDialogTypes";

export const DIALOG_I18N: DialogI18n = {
    activate: {
        en: {
            title: "Are you sure?",
            description: "This will activate the auction and make it live.",
            actionText: "Yes, activate",
            actionClassName: "bg-green-600 hover:bg-green-700",
            cancelText: "No, cancel"
        },
        sr: {
            title: "Da li ste sigurni?",
            description: "Ovo će aktivirati aukciju i učiniti je dostupnom.",
            actionText: "Da, Aktiviraj",
            actionClassName: "bg-green-600 hover:bg-green-700",
            cancelText: "Ipak, ne"
        }
    },
    close: {
        en: {
            title: "Are you sure?",
            description: "This will close the auction and mark it as completed.",
            actionText: "Yes, close",
            actionClassName: "bg-blue-600 hover:bg-blue-700",
            cancelText: "No, cancel"
        },
        sr: {
            title: "Da li ste sigurni?",
            description: "Ovo će zatvoriti aukciju i označiti je kao završenu.",
            actionText: "Da, Zatvori",
            actionClassName: "bg-blue-600 hover:bg-blue-700",
            cancelText: "Ipak, ne"
        }
    },
    delete: {
        en: {
            title: "Are you sure?",
            description: "This action cannot be undone. This will permanently delete the auction.",
            actionText: "Delete",
            cancelText: "Cancel"
        },
        sr: {
            title: "Da li ste sigurni?",
            description: "Ova akcija se ne može poništiti. Ovo će trajno obrisati aukciju.",
            actionText: "Obriši",
            cancelText: "Otkaži"
        }
    },
    pause: {
        en: {
            title: "Pause Auction?",
            description: "This will temporarily pause the auction. Bidding will be suspended until you resume it.",
            actionText: "Yes, pause",
            actionClassName: "bg-orange-600 hover:bg-orange-700",
            cancelText: "No, cancel"
        },
        sr: {
            title: "Pauzirati Aukciju?",
            description: "Ovo će privremeno pauzirati aukciju. Licitiranje će biti obustavljeno dok je ne nastavite.",
            actionText: "Da, pauziraj",
            actionClassName: "bg-orange-600 hover:bg-orange-700",
            cancelText: "Ipak, ne"
        }
    },
    cancel: {
        en: {
            title: "Cancel Auction?",
            description: "This will cancel the auction and all lots will become available again. This action cannot be undone.",
            actionText: "Yes, cancel auction",
            actionClassName: "bg-red-600 hover:bg-red-700",
            cancelText: "No, keep it"
        },
        sr: {
            title: "Otkazati Aukciju?",
            description: "Ovo će otkazati aukciju i svi lotovi će ponovo biti dostupni. Ova akcija se ne može poništiti.",
            actionText: "Da, otkaži aukciju",
            actionClassName: "bg-red-600 hover:bg-red-700",
            cancelText: "Ne, zadrži"
        }
    },
    resume: {
        en: {
            title: "Resume Auction?",
            description: "This will resume the auction and make it active again. Bidding will be enabled.",
            actionText: "Yes, resume",
            actionClassName: "bg-green-600 hover:bg-green-700",
            cancelText: "No, cancel"
        },
        sr: {
            title: "Nastaviti Aukciju?",
            description: "Ovo će nastaviti aukciju i učiniti je ponovo aktivnom. Licitiranje će biti omogućeno.",
            actionText: "Da, nastavi",
            actionClassName: "bg-green-600 hover:bg-green-700",
            cancelText: "Ipak, ne"
        }
    },
    reactivate: {
        en: {
            title: "Reactivate Auction?",
            description: "This will reactivate the cancelled auction and set it back to 'Upcoming' status. All lots will be marked as 'On Auction' again.",
            actionText: "Yes, reactivate",
            actionClassName: "bg-green-600 hover:bg-green-700",
            cancelText: "No, cancel"
        },
        sr: {
            title: "Reaktivirati Aukciju?",
            description: "Ovo će reaktivirati otkazanu aukciju i vratiti je u status 'Predstojeća'. Svi lotovi će ponovo dobiti status 'Na aukciji'.",
            actionText: "Da, reaktiviraj",
            actionClassName: "bg-green-600 hover:bg-green-700",
            cancelText: "Ipak, ne"
        }
    }
};
