import { Product, ProductStatus } from "@/contexts/DataContext";

export type ProductStaticDialogKey =
    | "delete"
    | "bulkDelete"
    | "bulkStatus"
    | "inlineStatus"
    | "auctionRemoval"
    | "auctionDeleteWarning";

export type ProductDialogKey = ProductStaticDialogKey;

export interface ProductDialogConfig {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
    onAction: () => void;
    icon?: any;
}

export interface ProductI18nContent {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
}

export type ProductDialogI18n = Record<ProductStaticDialogKey, { en: ProductI18nContent; sr: ProductI18nContent }>;

export interface PendingStatusChange {
    product: Product;
    newStatus: ProductStatus;
}
