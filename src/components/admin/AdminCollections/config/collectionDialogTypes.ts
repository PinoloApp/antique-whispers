import { CollectionStatus } from "@/contexts/DataContext";
import { LucideIcon } from "lucide-react";

export type CollectionStaticDialogKey =
    | "delete"
    | "bulkDelete"
    | "bulkStatus"
    | "auctionDeleteWarning"
    | "auctionRemoval"
    | "inlineStatus";

export type CollectionDynamicDialogKey = "create" | "update";

export type CollectionDialogKey =
    | CollectionStaticDialogKey
    | CollectionDynamicDialogKey;

export interface CollectionDialogConfig {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
    onAction: () => void;
    icon?: LucideIcon;
}

export interface CollectionDialogI18nContent {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
}

export type CollectionDialogI18n = Record<
    CollectionStaticDialogKey,
    {
        en: CollectionDialogI18nContent;
        sr: CollectionDialogI18nContent;
    }
>;
