import { UserRole, UserStatus, User } from "@/types/adminUsers.types";
import { ShieldCheck, User as UserIcon, CheckCircle, Ban, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

export const isPhoneValid = (phone?: string): boolean => {
    if (!phone || !phone.trim()) return true; // Optional field
    const phoneRegex = /^\+?[0-9\s-]{6,20}$/;
    return phoneRegex.test(phone.trim());
};

export const getRoleBadgeConfig = (role: UserRole) => {
    switch (role) {
        case "admin":
            return {
                className: "bg-red-500/20 text-red-600 border-red-500/30",
                icon: ShieldCheck,
                labelKey: "adminRole",
            };
        default:
            return {
                className: "bg-background text-foreground border-border",
                icon: UserIcon,
                labelKey: "user",
            };
    }
};

export const getStatusBadgeConfig = (status: UserStatus | undefined) => {
    switch (status) {
        case "active":
            return {
                className: "bg-green-500/20 text-green-600 border-green-500/30",
                icon: CheckCircle,
                labelKey: "active",
            };
        case "banned":
            return {
                className: "bg-red-500/20 text-red-600 border-red-500/30",
                icon: Ban,
                labelKey: "banned",
            };
        default:
            return {
                className: "bg-green-500/20 text-green-600 border-green-500/30",
                icon: CheckCircle,
                labelKey: "active",
            };
    }
};

export const getBulkActionDescription = (
    actionableCount: number,
    totalCount: number,
    action: "ban" | "unban" | "roleChange",
    roleTarget?: UserRole
): string => {
    const skipped = totalCount - actionableCount;
    if (action === "ban") {
        const baseDesc = `${actionableCount} of ${totalCount} users will be banned.`;
        return skipped > 0 ? `${baseDesc} ${skipped} will be skipped (admins or already banned).` : baseDesc;
    }
    if (action === "unban") {
        const baseDesc = `${actionableCount} of ${totalCount} users will be unbanned.`;
        return skipped > 0 ? `${baseDesc} ${skipped} will be skipped (already active).` : baseDesc;
    }

    // roleChange
    const role = roleTarget === "admin" ? "Admin" : "User";
    const baseDesc = `${actionableCount} of ${totalCount} users will be changed to ${role}.`;
    return skipped > 0 ? `${baseDesc} ${skipped} will be skipped (already ${role.toLowerCase()}).` : baseDesc;
};

export const getPaginationPages = (currentPage: number, totalPages: number): number[] => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => totalPages <= 7 || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1));
};

export const getUserInfoFields = (user: User, t: (key: any) => string) => [
    { icon: Mail, value: user.email, show: true },
    { icon: Phone, value: user.phone, show: !!user.phone },
    { icon: Calendar, value: `${t("joined")} ${format(user.createdAt, "dd.MM.yyyy")}`, show: true },
    { icon: Calendar, value: `${t("lastLogin")} ${user.lastLoginAt ? format(user.lastLoginAt, "dd.MM.yyyy HH:mm") : ""}`, show: !!user.lastLoginAt },
];

export const getPaginationLabel = (startIndex: number, endIndex: number, total: number, label: string, t: (key: any) => string): string => {
    return `${t("showing")} ${startIndex + 1}-${Math.min(endIndex, total)} ${t("of")} ${total} ${t(label)}`;
};
