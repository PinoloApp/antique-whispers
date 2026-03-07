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
import { Mail, Phone, Calendar, MoreHorizontal, Eye, Pencil, ShieldCheck, User as UserIcon, Ban, CheckCircle, Trash2 } from "lucide-react";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { Badge } from "@/components/ui/badge";
import { getRoleBadgeConfig, getStatusBadgeConfig } from "@/utils/adminUsers.utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminUserRowProps {
    user: User;
    isSelected: boolean;
    onSelectUser: (userId: string, checked: boolean) => void;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onRoleChange: (user: User, role: UserRole) => void;
    onBanStatusChange: (user: User, status: UserStatus) => void;
    onDelete: (user: User) => void;
}

const AdminUserRow = React.memo(
    ({
        user,
        isSelected,
        onSelectUser,
        onView,
        onEdit,
        onRoleChange,
        onBanStatusChange,
        onDelete,
    }: AdminUserRowProps) => {
        const { language, t } = useLanguage();

        const roleConfig = getRoleBadgeConfig(user.role);
        const RoleIcon = roleConfig.icon;
        const statusConfig = getStatusBadgeConfig(user.status);
        const StatusIcon = statusConfig.icon;

        return (
            <tr className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectUser(user.id, !!checked)}
                    />
                </td>
                <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                    </div>
                    {user.phone && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.phone}
                        </div>
                    )}
                </td>
                <td className="px-6 py-4 text-center">
                    <Badge className={roleConfig.className} variant={roleConfig.className.includes("border-border") ? "outline" : "default"}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {t(roleConfig.labelKey)}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                    <Badge className={statusConfig.className}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {t(statusConfig.labelKey)}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="text-sm">
                        <div className="text-foreground">
                            {user.totalBids} {language === "en" ? "bids" : "ponuda"}
                        </div>
                        <div className="text-muted-foreground">
                            {user.wonAuctions} {language === "en" ? "won" : "dobio"}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(user.createdAt, "dd.MM.yyyy")}
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
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
                            {user.role !== "admin" ? (
                                <DropdownMenuItem onClick={() => onRoleChange(user, "admin")}>
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Make Admin" : "Postavi za Admina"}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => onRoleChange(user, "user")}>
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Make User" : "Postavi za Korisnika"}
                                </DropdownMenuItem>
                            )}
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
                </td>
            </tr>
        );
    }
);
AdminUserRow.displayName = "AdminUserRow";

export default AdminUserRow;
