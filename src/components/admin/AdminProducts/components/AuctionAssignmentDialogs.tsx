import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Pause, Clock, Loader2 } from "lucide-react";
import { useAuctionAssignment } from "../hooks/useAuctionAssignment";

interface AuctionAssignmentDialogsProps {
    language: "en" | "sr";
    auctionHook: ReturnType<typeof useAuctionAssignment>;
}

export function AuctionAssignmentDialogs({ language, auctionHook }: AuctionAssignmentDialogsProps) {
    const {
        activeAssignmentDialog,
        openAssignmentDialog,
        closeAssignmentDialog,
        categoryAuctions,
        pendingAssignAuctionId,
        setPendingAssignAuctionId,
        handleAssignToAuction,
        handleSkipAuctionAssign,
        auctions,
    } = auctionHook;

    return (
        <>
            <Dialog
                open={activeAssignmentDialog === "selectAuction"}
                onOpenChange={(open) => {
                    if (!open) handleSkipAuctionAssign();
                }}
            >
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{language === "en" ? "Category is on Auction" : "Kategorija je na Aukciji"}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {language === "en"
                            ? "The selected category is already part of the following auction(s). Would you like to assign this product to one of them?"
                            : "Izabrana kategorija je već deo sledećih aukcija. Da li želite da pridružite ovaj proizvod nekoj od njih?"}
                    </p>
                    <div className="space-y-2 mt-2">
                        {categoryAuctions.map((auction) => (
                            <Button
                                key={auction.id}
                                variant="outline"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                    setPendingAssignAuctionId(auction.id);
                                    openAssignmentDialog("confirmAssign");
                                }}
                            >
                                <span className="truncate">{auction.title[language]}</span>
                                <Badge
                                    className={`ml-auto shrink-0 flex items-center gap-1 ${auction.status === "active"
                                        ? "bg-green-500/20 text-green-600 border-green-500/30"
                                        : auction.status === "paused"
                                            ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                                            : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                        }`}
                                >
                                    {auction.status === "active" ? (
                                        <PlayCircle className="w-3 h-3" />
                                    ) : auction.status === "paused" ? (
                                        <Pause className="w-3 h-3" />
                                    ) : (
                                        <Clock className="w-3 h-3" />
                                    )}
                                    {auction.status === "active"
                                        ? language === "en"
                                            ? "Active"
                                            : "Aktivna"
                                        : auction.status === "paused"
                                            ? language === "en"
                                                ? "Paused"
                                                : "Pauzirana"
                                            : language === "en"
                                                ? "Upcoming"
                                                : "Predstojeća"}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button variant="ghost" onClick={() => openAssignmentDialog("confirmSkip")}>
                            {language === "en" ? "Skip" : "Preskoči"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Assign to Auction */}
            <AlertDialog open={activeAssignmentDialog === "confirmAssign"} onOpenChange={(open) => !open && closeAssignmentDialog()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{language === "en" ? "Assign to Auction?" : "Pridružiti Aukciji?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {language === "en"
                                ? `Are you sure you want to assign this product to "${auctions.find((a) => a.id === pendingAssignAuctionId)?.title.en
                                }"? The product status will be changed to "On Auction".`
                                : `Da li ste sigurni da želite da pridružite ovaj proizvod aukciji "${auctions.find((a) => a.id === pendingAssignAuctionId)?.title.sr
                                }"? Status proizvoda će biti promenjen u "Na Aukciji".`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={auctionHook.isMutating} onClick={() => openAssignmentDialog("selectAuction")}>{language === "en" ? "Back" : "Nazad"}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={auctionHook.isMutating}
                            onClick={() => {
                                if (pendingAssignAuctionId !== null) handleAssignToAuction(pendingAssignAuctionId);
                            }}
                        >
                            {auctionHook.isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {auctionHook.isMutating
                                ? (language === "en" ? "Assigning..." : "Dodeljivanje...")
                                : (language === "en" ? "Yes, assign" : "Da, pridruži")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Skip Auction Assignment */}
            <AlertDialog open={activeAssignmentDialog === "confirmSkip"} onOpenChange={(open) => !open && closeAssignmentDialog()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{language === "en" ? "Skip Assignment?" : "Preskočiti dodelu?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {language === "en"
                                ? 'Are you sure you want to skip? The product will remain with the status "Available" and will not be assigned to any auction.'
                                : 'Da li ste sigurni da želite da preskočite? Proizvod će ostati sa statusom "Dostupan" i neće biti dodeljen nijednoj aukciji.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => openAssignmentDialog("selectAuction")}>{language === "en" ? "Back" : "Nazad"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleSkipAuctionAssign();
                            }}
                        >
                            {language === "en" ? "Yes, skip" : "Da, preskoči"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
