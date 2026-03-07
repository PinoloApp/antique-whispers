import { CategoryDialogI18n } from "./categoryDialogTypes";

export const CATEGORY_DIALOG_I18N: CategoryDialogI18n = {
    delete: {
        en: {
            title: "Are you sure?",
            description: "This action cannot be undone. This will permanently delete the category and all its subcategories.",
            actionText: "Delete",
            cancelText: "Cancel"
        },
        sr: {
            title: "Da li ste sigurni?",
            description: "Ova akcija se ne može poništiti. Ovo će trajno obrisati kategoriju i sve njene podkategorije.",
            actionText: "Obriši",
            cancelText: "Otkaži"
        }
    },
    bulkDeactivate: {
        en: {
            title: "Bulk Deactivate Categories",
            description: "You are about to deactivate selected categories.",
            actionText: "Deactivate",
            cancelText: "Cancel"
        },
        sr: {
            title: "Masovna Deaktivacija Kategorija",
            description: "Deaktiviraćete selektovane kategorije.",
            actionText: "Deaktiviraj",
            cancelText: "Otkaži"
        }
    },
    bulkActivate: {
        en: {
            title: "Bulk Activate Categories",
            description: "You are about to activate selected categories.",
            actionText: "Activate",
            cancelText: "Cancel"
        },
        sr: {
            title: "Masovna Aktivacija Kategorija",
            description: "Aktiviraćete selektovane kategorije.",
            actionText: "Aktiviraj",
            cancelText: "Otkaži"
        }
    },
    bulkDelete: {
        en: {
            title: "Delete Selected Categories?",
            description: "You are about to permanently delete selected categories and all their subcategories. This action cannot be undone.",
            actionText: "Delete",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            cancelText: "Cancel"
        },
        sr: {
            title: "Obrisati Izabrane Kategorije?",
            description: "Trajno ćete obrisati selektovane kategorije i sve njihove podkategorije. Ova akcija se ne može poništiti.",
            actionText: "Obriši",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            cancelText: "Otkaži"
        }
    }
};
