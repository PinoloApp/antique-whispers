import React from "react";
import { format } from "date-fns";
import { User, UserBidHistory, UserRole, UserStatus } from "@/types/adminUsers.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Gavel, Trophy, XCircle, Clock, Pencil } from "lucide-react";
import { getRoleBadgeConfig, getStatusBadgeConfig, getUserInfoFields } from "@/utils/adminUsers.utils";
import { USER_STAT_FIELDS } from "@/constants/adminUsers.constants";
import { useLanguage } from "@/contexts/LanguageContext";

const BID_STATUS_CONFIG: Record<string, { labelKey: string, className: string, icon: any }> = {
    won: { labelKey: "won", className: "bg-green-500/20 text-green-600 border-green-500/30 text-xs", icon: Trophy },
    outbid: { labelKey: "outbid", className: "bg-red-500/20 text-red-600 border-red-500/30 text-xs", icon: XCircle },
    active: { labelKey: "activeBid", className: "bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs", icon: Clock },
};

const UserStatusBadges = React.memo(({ role, status, t }: { role: UserRole, status: UserStatus, t: (key: string) => string }) => {
    const rc = getRoleBadgeConfig(role);
    const sc = getStatusBadgeConfig(status);
    const RIcon = rc.icon;
    const SIcon = sc.icon;
    return (
        <>
            <Badge className={rc.className} variant={rc.className.includes("border-border") ? "outline" : "default"}>
                <RIcon className="w-3 h-3 mr-1" />
                {t(rc.labelKey)}
            </Badge>
            <Badge className={sc.className}>
                <SIcon className="w-3 h-3 mr-1" />
                {t(sc.labelKey)}
            </Badge>
        </>
    );
});
UserStatusBadges.displayName = "UserStatusBadges";

const UserViewHeader = React.memo(({ user, t }: { user: User, t: (key: string) => string }) => (
    <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
            <div className="font-medium text-lg">
                {user.firstName} {user.lastName}
            </div>
            <div className="flex gap-2 mt-1">
                <UserStatusBadges role={user.role} status={user.status} t={t} />
            </div>
        </div>
    </div>
));
UserViewHeader.displayName = "UserViewHeader";

const UserViewInfoFields = React.memo(({ user, t }: { user: User, t: (key: string) => string }) => (
    <div className="space-y-3 pt-4 border-t border-border">
        {getUserInfoFields(user, t).filter(field => field.show).map((field, idx) => {
            const FieldIcon = field.icon;
            return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                    <FieldIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{field.value}</span>
                </div>
            );
        })}
    </div>
));
UserViewInfoFields.displayName = "UserViewInfoFields";

const UserViewStats = React.memo(({ user, t }: { user: User, t: (key: string) => string }) => (
    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        {USER_STAT_FIELDS.map(({ valueKey, i18nKey }) => (
            <div key={valueKey} className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{user[valueKey as keyof User] as React.ReactNode}</div>
                <div className="text-sm text-muted-foreground">{t(i18nKey)}</div>
            </div>
        ))}
    </div>
));
UserViewStats.displayName = "UserViewStats";

const UserViewBidHistory = React.memo(({ bidHistory = [], t }: { bidHistory?: UserBidHistory[], t: (key: string) => string }) => (
    <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
            <Gavel className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-foreground">{t("bidHistory")}</h4>
        </div>
        {bidHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {bidHistory.map((bid) => {
                    const statusConfig = BID_STATUS_CONFIG[bid.status];
                    const StatusIcon = statusConfig?.icon;

                    return (
                        <div key={bid.id} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">#{bid.lotNumber}</span>
                                        <span className="font-medium text-sm text-foreground truncate">{bid.lotName}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{bid.auctionName}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-semibold text-sm text-foreground">
                                        {bid.bidAmount.toLocaleString()} RSD
                                    </div>
                                    <div className="text-xs text-muted-foreground">{format(bid.bidDate, "dd.MM.yyyy")}</div>
                                </div>
                            </div>
                            <div className="mt-2">
                                {statusConfig && (
                                    <Badge className={statusConfig.className}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {t(statusConfig.labelKey)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
                <Gavel className="w-8 h-8 mx-auto mb-2 opacity-50" />
                {t("noBidHistory")}
            </div>
        )}
    </div>
));
UserViewBidHistory.displayName = "UserViewBidHistory";

interface UserViewDialogProps {
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
    user: User | null;
    onClose: () => void;
    onEdit: (user: User) => void;
}

export const UserViewDialog: React.FC<UserViewDialogProps> = ({ isOpen, onOpenChange, user, onClose, onEdit }) => {
    const { t } = useLanguage();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{t("userDetails")}</DialogTitle>
                </DialogHeader>
                {user && (
                    <div className="space-y-4">
                        <UserViewHeader user={user} t={t} />
                        <UserViewInfoFields user={user} t={t} />
                        <UserViewStats user={user} t={t} />
                        <UserViewBidHistory bidHistory={user.bidHistory} t={t} />
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {t("close")}
                    </Button>
                    <Button onClick={() => { onClose(); if (user) onEdit(user); }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        {t("edit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
