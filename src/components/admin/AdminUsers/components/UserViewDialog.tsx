import React from "react";
import { format } from "date-fns";
import { User, UserBidHistory, UserRole, UserStatus } from "@/types/adminUsers.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Gavel, Trophy, XCircle, Clock, Pencil, ChevronDown } from "lucide-react";
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

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

const UserViewBidHistory = React.memo(({ bidHistory = [], t }: { bidHistory?: UserBidHistory[], t: (key: string) => string }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [expandedLots, setExpandedLots] = React.useState<Record<string, boolean>>({});

    const bidsByAuction = React.useMemo(() => {
        const grouped = bidHistory.reduce<Record<string, any>>((acc, bid) => {
            if (!acc[bid.auctionId]) {
                acc[bid.auctionId] = {
                    id: bid.auctionId,
                    name: bid.auctionName,
                    date: bid.auctionDate,
                    lots: []
                };
            }
            acc[bid.auctionId].lots.push(bid);
            return acc;
        }, {});

        return Object.values(grouped);
    }, [bidHistory]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string; icon: any }> = {
            won: {
                label: language === "en" ? "Won" : "Dobijeno",
                className: "bg-green-500/10 text-green-700 border-green-200",
                icon: Trophy,
            },
            active: {
                label: language === "en" ? "Active" : "Aktivno",
                className: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
                icon: Clock,
            },
            lost: {
                label: language === "en" ? "Lost" : "Izgubljeno",
                className: "bg-red-500/10 text-red-700 border-red-200",
                icon: XCircle,
            },
            cancelled: {
                label: language === "en" ? "Cancelled" : "Otkazano",
                className: "bg-slate-500/10 text-slate-600 border-slate-200",
                icon: XCircle,
            },
            paused: {
                label: language === "en" ? "Paused" : "Pauzirano",
                className: "bg-orange-500/10 text-orange-600 border-orange-200",
                icon: Clock,
            },
        };
        const v = variants[status] || variants.lost;
        const Icon = v.icon;

        return (
            <Badge variant="outline" className={`flex items-center gap-1 py-0 px-2 text-[10px] font-medium ${v.className}`}>
                <Icon className="w-3 h-3" />
                {v.label}
            </Badge>
        );
    };

    return (
        <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
                <Gavel className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-foreground">{t("bidHistory")}</h4>
            </div>
            {bidsByAuction.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {bidsByAuction.map((auction) => {
                        const isExpanded = expandedLots[`auction-bid-${auction.id}`] ?? false;
                        return (
                            <Collapsible
                                key={auction.id}
                                open={isExpanded}
                                onOpenChange={(open) =>
                                    setExpandedLots((prev) => ({ ...prev, [`auction-bid-${auction.id}`]: open }))
                                }
                            >
                                <CollapsibleTrigger asChild>
                                    <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer mb-1 bg-muted/20">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-foreground">{auction.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{auction.date}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">
                                            {auction.lots.length} {language === "en" ? "lots" : "lotova"}
                                        </Badge>
                                        <ChevronDown
                                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="ml-2 border-l-2 border-primary/20 pl-4 space-y-2 mt-2 mb-4">
                                        {auction.lots.map((bid: any) => (
                                            <div
                                                key={bid.id}
                                                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-default"
                                            >
                                                <img
                                                    src={bid.image}
                                                    alt={bid.lotName}
                                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0 text-xs">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-bold text-primary">Lot #{bid.lotNumber}</span>
                                                        {getStatusBadge(bid.status)}
                                                    </div>
                                                    <p className="font-medium text-foreground truncate">{bid.lotName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-sm text-foreground">€{bid.bidAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                    <Gavel className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    {t("noBidHistory")}
                </div>
            )}
        </div>
    );
});
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
