import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { ShieldCheck, User as UserIcon, CheckCircle, Ban, Trash2 } from "lucide-react";

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

export const FILTER_ROLE_OPTIONS: { value: UserRole | "all"; label: { en: string; sr: string } }[] = [
    { value: "all", label: { en: "All Roles", sr: "Sve Uloge" } },
    { value: "admin", label: { en: "Admin", sr: "Admin" } },
    { value: "user", label: { en: "User", sr: "Korisnik" } },
];

export const FILTER_STATUS_OPTIONS: { value: UserStatus | "all"; label: { en: string; sr: string } }[] = [
    { value: "all", label: { en: "All Statuses", sr: "Svi Statusi" } },
    { value: "active", label: { en: "Active", sr: "Aktivan" } },
    { value: "banned", label: { en: "Banned", sr: "Banovan" } },
];

export const BULK_ACTION_BUTTONS = [
    { key: "ban", icon: Ban, onClickName: "handleBulkBan", i18nKey: "ban", className: "hover:bg-transparent hover:text-foreground" },
    { key: "unban", icon: CheckCircle, onClickName: "handleBulkUnban", i18nKey: "unban", className: "hover:bg-transparent hover:text-foreground" },
    { key: "delete", icon: Trash2, onClickName: "handleBulkDelete", i18nKey: "delete", className: "text-destructive hover:text-destructive hover:bg-transparent" },
] as const;

export const BULK_ROLE_OPTIONS = [
    { role: "admin", icon: ShieldCheck, i18nKey: "adminRole" },
    { role: "user", icon: UserIcon, i18nKey: "user" },
] as const;

export const USER_STAT_FIELDS = [
    { valueKey: "totalBids", i18nKey: "totalBids" },
    { valueKey: "wonAuctions", i18nKey: "wonAuctions" },
] as const;

