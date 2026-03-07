import React from "react";
import { Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuctionActions } from "./hooks/useAuctionActions";
import ReusableAlertDialog from "@/components/admin/AdminUsers/ReusableAlertDialog";
import { buildDialogConfig } from "./config/auctionDialogConfig";
import { AuctionFormExplicit } from "./config/auctionDialogTypes";

interface AuctionDialogsProps {
    language: "en" | "sr";
    actions: ReturnType<typeof useAuctionActions>;
    auctionForm: AuctionFormExplicit;
}

export const AuctionDialogs: React.FC<AuctionDialogsProps> = ({ language, actions, auctionForm }) => {
    const {
        activeDialog,
        closeDialog,
        addBidFormData,
        setAddBidFormData,
        handleAddLiveBidClick,
        isSubmitting,
    } = actions;

    const dialogConfig = buildDialogConfig(language, actions, auctionForm);

    const currentConfig = activeDialog && dialogConfig[activeDialog] ? dialogConfig[activeDialog] : null;

    return (
        <>
            {/* Generic ReusableAlertDialog Renderer */}
            <ReusableAlertDialog
                open={!!currentConfig}
                onOpenChange={(open) => !open && !isSubmitting && closeDialog()}
                title={currentConfig?.title || ""}
                description={currentConfig?.description || ""}
                onAction={currentConfig?.onAction || (() => { })}
                actionText={currentConfig?.actionText || ""}
                actionClassName={currentConfig?.actionClassName}
                cancelText={currentConfig?.cancelText}
                isMutating={isSubmitting}
            />

            {/* Custom Dialogs (addBid) */}
            <Dialog
                open={activeDialog === "addBid"}
                onOpenChange={(open) => !open && !isSubmitting && closeDialog()}
            >
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-orange-600" />
                            {language === "en" ? "Add Live Auction Bid" : "Dodaj Ponudu sa Live Aukcije"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-md">
                            <p className="text-sm text-orange-700">
                                {language === "en"
                                    ? "This bid will be marked as coming from a live auction event."
                                    : "Ova ponuda će biti označena kao ponuda sa live aukcije."}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">{language === "en" ? "Full Name" : "Puno Ime i Prezime"} *</label>
                            <Input
                                value={addBidFormData.bidderName}
                                onChange={(e) => setAddBidFormData({ ...addBidFormData, bidderName: e.target.value })}
                                placeholder={language === "en" ? "e.g. John Smith" : "npr. Petar Perić"}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">{language === "en" ? "Bidder Email" : "Email Ponuđača"}</label>
                            <Input
                                type="email"
                                value={addBidFormData.bidderEmail}
                                onChange={(e) => setAddBidFormData({ ...addBidFormData, bidderEmail: e.target.value })}
                                placeholder={language === "en" ? "Optional" : "Opciono"}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                {language === "en" ? "Bid Amount (€)" : "Iznos Ponude (€)"} *
                            </label>
                            <Input
                                type="number"
                                value={addBidFormData.amount}
                                onChange={(e) => setAddBidFormData({ ...addBidFormData, amount: e.target.value })}
                                placeholder={language === "en" ? "Enter bid amount" : "Unesite iznos ponude"}
                                min="1"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => closeDialog()} disabled={isSubmitting}>
                            {language === "en" ? "Cancel" : "Otkaži"}
                        </Button>
                        <Button onClick={handleAddLiveBidClick} className="gap-2" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                            {language === "en" ? "Add Live Bid" : "Dodaj Live Ponudu"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
