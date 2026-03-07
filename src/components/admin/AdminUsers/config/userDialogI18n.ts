import { UserDialogI18n } from "./userDialogTypes";

export const USER_DIALOG_I18N: UserDialogI18n = {
    createConfirm: {
        en: {
            title: "Create User?",
            description: "Are you sure you want to create this user?",
            actionText: "Create",
            cancelText: "Cancel",
        },
        sr: {
            title: "Kreirati korisnika?",
            description: "Da li ste sigurni da želite da kreirate ovog korisnika?",
            actionText: "Kreiraj",
            cancelText: "Otkaži",
        },
    },
    editConfirm: {
        en: {
            title: "Save Changes?",
            description: "Are you sure you want to save changes to this user?",
            actionText: "Save Changes",
            cancelText: "Cancel",
        },
        sr: {
            title: "Sačuvati izmene?",
            description: "Da li ste sigurni da želite da sačuvate izmene za ovog korisnika?",
            actionText: "Sačuvaj izmene",
            cancelText: "Otkaži",
        },
    },
    delete: {
        en: {
            title: "Delete User",
            description: "This action cannot be undone. This will permanently delete the user account.",
            actionText: "Delete",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Obriši korisnika",
            description: "Ova akcija se ne može poništiti. Ovo će trajno obrisati korisnički nalog.",
            actionText: "Obriši",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    ban: {
        en: {
            title: "Ban User",
            description: "Are you sure you want to ban this user? They will no longer be able to log in or place bids.",
            actionText: "Ban",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Banuj korisnika",
            description: "Da li ste sigurni da želite da banujete ovog korisnika? Više neće moći da se prijavi niti da licitira.",
            actionText: "Banuj",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    unban: {
        en: {
            title: "Unban User",
            description: "Are you sure you want to unban this user? They will regain access to their account.",
            actionText: "Unban",
            cancelText: "Cancel",
            actionClassName: "bg-green-600 text-white hover:bg-green-700",
        },
        sr: {
            title: "Debanuj korisnika",
            description: "Da li ste sigurni da želite da debanujete ovog korisnika? Ponovo će dobiti pristup svom nalogus.",
            actionText: "Debanuj",
            cancelText: "Otkaži",
            actionClassName: "bg-green-600 text-white hover:bg-green-700",
        },
    },
    roleChange: {
        en: {
            title: "Change User Role",
            description: "Are you sure you want to change the role for this user?",
            actionText: "Change Role",
            cancelText: "Cancel",
        },
        sr: {
            title: "Promeni ulogu korisnika",
            description: "Da li ste sigurni da želite da promenite ulogu ovog korisnika?",
            actionText: "Promeni ulogu",
            cancelText: "Otkaži",
        },
    },
    bulkDelete: {
        en: {
            title: "Delete Selected Users?",
            description: "This action cannot be undone. Selected users will be permanently deleted.",
            actionText: "Delete",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Obrisati izabrane korisnike?",
            description: "Ova akcija se ne može poništiti. Izabrani korisnici će biti trajno obrisani.",
            actionText: "Obriši",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    bulkBan: {
        en: {
            title: "Ban Selected Users?",
            description: "Selected users will be banned and lose access to the platform.",
            actionText: "Ban",
            cancelText: "Cancel",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
        sr: {
            title: "Banovati izabrane korisnike?",
            description: "Izabrani korisnici će biti banovani i izgubiće pristup platformi.",
            actionText: "Banuj",
            cancelText: "Otkaži",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        },
    },
    bulkUnban: {
        en: {
            title: "Unban Selected Users?",
            description: "Selected users will gain access to the platform again.",
            actionText: "Unban",
            cancelText: "Cancel",
            actionClassName: "bg-green-600 text-white hover:bg-green-700",
        },
        sr: {
            title: "Debanovati izabrane korisnike?",
            description: "Izabrani korisnici će ponovo dobiti pristup platformi.",
            actionText: "Debanuj",
            cancelText: "Otkaži",
            actionClassName: "bg-green-600 text-white hover:bg-green-700",
        },
    },
    bulkRoleChange: {
        en: {
            title: "Change Role for Selected Users?",
            description: "The role of selected users will be updated.",
            actionText: "Change Role",
            cancelText: "Cancel",
        },
        sr: {
            title: "Promeniti ulogu za izabrane korisnike?",
            description: "Uloga izabranih korisnika će biti ažurirana.",
            actionText: "Promeni ulogu",
            cancelText: "Otkaži",
        },
    },
};
