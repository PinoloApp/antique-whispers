import { useAuctionActions } from "../hooks/useAuctionActions";
import {
    DialogKey,
    StaticDialogKey,
    DialogConfig,
    AuctionFormExplicit,
    DynamicDialogKey
} from "./auctionDialogTypes";
import { DIALOG_I18N } from "./auctionDialogI18n";

type AuctionActions = ReturnType<typeof useAuctionActions>;

const getActionHandlers = (actions: AuctionActions): Record<StaticDialogKey, () => void> => ({
    activate: actions.handleActivateConfirm,
    close: actions.handleCloseConfirm,
    delete: actions.handleDeleteConfirm,
    pause: actions.handlePauseConfirm,
    cancel: actions.handleCancelConfirm,
    resume: actions.handleResumeConfirm,
    reactivate: actions.handleReactivateConfirm,
});

const getDynamicDialogConfigs = (
    language: "en" | "sr",
    actions: AuctionActions,
    auctionForm: AuctionFormExplicit
): Record<DynamicDialogKey, DialogConfig> => {
    const {
        handleCreateConfirm,
        handleUpdateConfirm,
        handleDeleteFinalConfirm,
        getDeleteSecondAlertText,
        handleConfirmAddLiveBid,
        addBidFormData,
        pendingAuctionData,
    } = actions;

    return {
        create: {
            title: language === "en" ? "Create Auction?" : "Kreirati Aukciju?",
            description: language === "en"
                ? `You are about to create a new auction "${pendingAuctionData?.title.en}" with ${pendingAuctionData?.lotIds?.length || 0} lot(s). The selected lots will be marked as "On Auction".`
                : `Upravo ćete kreirati novu aukciju "${pendingAuctionData?.title.sr}" sa ${pendingAuctionData?.lotIds?.length || 0} lot(ova). Izabrani lotovi će dobiti status "Na aukciji".`,
            onAction: () => handleCreateConfirm(() => auctionForm.setIsOpen(false), auctionForm.resetForm),
            actionText: language === "en" ? "Yes, create" : "Da, kreiraj",
            cancelText: language === "en" ? "Cancel" : "Otkaži"
        },
        update: {
            title: language === "en" ? "Update Auction?" : "Ažurirati Aukciju?",
            description: language === "en"
                ? `You are about to update the auction "${pendingAuctionData?.title.en}" with ${pendingAuctionData?.lotIds?.length || 0} lot(s). This will update the lot statuses accordingly.`
                : `Upravo ćete ažurirati aukciju "${pendingAuctionData?.title.sr}" sa ${pendingAuctionData?.lotIds?.length || 0} lot(ova). Ovo će ažurirati statuse lotova u skladu sa promenama.`,
            onAction: () => handleUpdateConfirm(auctionForm.editingAuction, () => auctionForm.setIsOpen(false), auctionForm.resetForm),
            actionText: language === "en" ? "Yes, update" : "Da, ažuriraj",
            cancelText: language === "en" ? "Cancel" : "Otkaži"
        },
        deleteSecond: {
            title: getDeleteSecondAlertText().title,
            description: getDeleteSecondAlertText().description,
            onAction: handleDeleteFinalConfirm,
            actionText: language === "en" ? "Yes, delete permanently" : "Da, obriši trajno",
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            cancelText: language === "en" ? "No, keep it" : "Ne, zadrži"
        },
        confirmAddBid: {
            title: language === "en" ? "Confirm Live Bid" : "Potvrdite Live Ponudu",
            description:
                language === "en"
                    ? `Are you sure you want to add a live auction bid of €${parseFloat(addBidFormData.amount || "0").toLocaleString()} for "${addBidFormData.bidderName}"?`
                    : `Da li ste sigurni da želite dodati live ponudu od €${parseFloat(addBidFormData.amount || "0").toLocaleString()} za "${addBidFormData.bidderName}"?`,
            onAction: handleConfirmAddLiveBid,
            actionText: language === "en" ? "Confirm" : "Potvrdi",
        }
    };
};

export const buildDialogConfig = (
    language: "en" | "sr",
    actions: AuctionActions,
    auctionForm: AuctionFormExplicit
): Partial<Record<DialogKey, DialogConfig>> => {
    const handlers = getActionHandlers(actions);
    const dynamicConfigs = getDynamicDialogConfigs(language, actions, auctionForm);

    // Assemble static configs
    const staticConfigs = (Object.keys(DIALOG_I18N) as StaticDialogKey[]).reduce((acc, key) => {
        const i18n = DIALOG_I18N[key][language];
        acc[key] = {
            ...i18n,
            onAction: handlers[key],
        };
        return acc;
    }, {} as Record<StaticDialogKey, DialogConfig>);

    return {
        ...staticConfigs,
        ...dynamicConfigs,
    };
};
