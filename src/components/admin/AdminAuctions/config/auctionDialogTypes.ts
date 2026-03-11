export type StaticDialogKey =
    | "activate"
    | "close"
    | "delete"
    | "pause"
    | "cancel"
    | "resume";

export type DynamicDialogKey =
    | "create"
    | "update"
    | "deleteSecond"
    | "confirmAddBid";

export type DialogKey = StaticDialogKey | DynamicDialogKey;

export interface DialogConfig {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
    onAction: () => void;
}

export interface I18nContent {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
}

export type DialogI18n = Record<StaticDialogKey, { en: I18nContent; sr: I18nContent }>;

export interface AuctionFormExplicit {
    setIsOpen: (open: boolean) => void;
    resetForm: () => void;
    editingAuction: any; // Keeping any for the auction object as it's complex and not defined here
}
