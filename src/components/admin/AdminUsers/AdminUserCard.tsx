import React from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, ShieldCheck, User as UserIcon, Ban, CheckCircle, Trash2 } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { Badge } from "@/components/ui/badge";
import { getRoleBadgeConfig, getStatusBadgeConfig } from "@/utils/adminUsers.utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminUserCardProps {
    user: User;
    isSelected: boolean;
    onSelectUser: (userId: string, checked: boolean) => void;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onBanStatusChange: (user: User, status: UserStatus) => void;
    onDelete: (user: User) => void;
}

const AdminUserCard = React.memo(
    ({
        user,
        isSelected,
        onSelectUser,
        onView,
        onEdit,
        onBanStatusChange,
        onDelete,
    }: AdminUserCardProps) => {
        const { language, t } = useLanguage();

        const roleConfig = getRoleBadgeConfig(user.role);
        const RoleIcon = roleConfig.icon;
        const statusConfig = getStatusBadgeConfig(user.status);
        const StatusIcon = statusConfig.icon;

        return (
            <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelectUser(user.id, !!checked)}
                            className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(user)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {language === "en" ? "View Details" : "Pogledaj Detalje"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                {language === "en" ? "Edit" : "Uredi"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.role !== "admin" && user.status !== "banned" && (
                                <DropdownMenuItem onClick={() => onBanStatusChange(user, "banned")}>
                                    <Ban className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Ban User" : "Banuj Korisnika"}
                                </DropdownMenuItem>
                            )}
                            {user.status === "banned" && (
                                <DropdownMenuItem onClick={() => onBanStatusChange(user, "active")}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Unban User" : "Odbanuj Korisnika"}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {language === "en" ? "Delete" : "Obriši"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={roleConfig.className} variant={roleConfig.className.includes("border-border") ? "outline" : "default"}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {t(roleConfig.labelKey)}
                    </Badge>
                    <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {t(statusConfig.labelKey)}
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">
                        {language === "en" ? "Bids:" : "Ponude:"} <span className="text-foreground">{user.totalBids}</span>
                    </div>
                    <div className="text-muted-foreground">
                        {language === "en" ? "Won:" : "Dobio:"} <span className="text-foreground">{user.wonAuctions}</span>
                    </div>
                </div>
            </div>
        );
    }
);
AdminUserCard.displayName = "AdminUserCard";

export default AdminUserCard;
