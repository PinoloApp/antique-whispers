import { LucideIcon } from "lucide-react";

export type UserStaticDialogKey =
    | "delete"
    | "ban"
    | "unban"
    | "roleChange"
    | "bulkDelete"
    | "bulkBan"
    | "bulkUnban"
    | "bulkRoleChange"
    | "createConfirm"
    | "editConfirm";

export type UserDynamicDialogKey = "create" | "edit" | "view";

export type UserDialogKey =
    | UserStaticDialogKey
    | UserDynamicDialogKey;

export interface UserDialogConfig {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
    onAction: () => void;
    icon?: LucideIcon;
    isMutating?: boolean;
}

export interface UserDialogI18nContent {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
}

export type UserDialogI18n = Record<
    UserStaticDialogKey,
    {
        en: UserDialogI18nContent;
        sr: UserDialogI18nContent;
    }
>;
