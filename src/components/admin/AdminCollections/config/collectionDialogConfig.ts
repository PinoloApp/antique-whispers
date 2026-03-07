import { useCollectionActions } from "../hooks/useCollectionActions";
import { useCollectionBulkActions } from "../hooks/useCollectionBulkActions";
import {
    CollectionDialogKey,
    CollectionStaticDialogKey,
    CollectionDialogConfig,
} from "./collectionDialogTypes";
import { COLLECTION_DIALOG_I18N } from "./collectionDialogI18n";
import { CollectionStatus, Auction } from "@/contexts/DataContext";

type CollectionActions = ReturnType<typeof useCollectionActions>;
type CollectionBulkActions = ReturnType<typeof useCollectionBulkActions>;

const getActionHandlers = (
    actions: CollectionActions,
    bulkActions: CollectionBulkActions
): Record<CollectionStaticDialogKey, () => void> => ({
    delete: actions.handleDeleteConfirm,
    bulkDelete: bulkActions.handleBulkDeleteConfirm,
    bulkStatus: bulkActions.handleBulkStatusConfirm,
    auctionDeleteWarning: bulkActions.closeBulkDialog,
    auctionRemoval: actions.executeStatusChange,
    inlineStatus: actions.handleConfirmInlineStatusChange,
});

const getDynamicDialogConfigs = (
    language: "en" | "sr",
    actions: CollectionActions,
    bulkActions: CollectionBulkActions,
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[],
    auctions: Auction[]
): Partial<Record<CollectionDialogKey, CollectionDialogConfig>> => {
    const { pendingStatusChange } = actions;
    const { selectedCollections, bulkStatus, getDeletableCollections } = bulkActions;

    return {
        bulkDelete: {
            title: COLLECTION_DIALOG_I18N.bulkDelete[language].title,
            description: (() => {
                const deletable = getDeletableCollections();
                const skippedCount = selectedCollections.length - deletable.length;
                if (language === "en") {
                    return `${deletable.length} of ${selectedCollections.length} collections will be deleted.${skippedCount > 0 ? ` ${skippedCount} collections on auction will be skipped.` : ""} This action cannot be undone.`;
                }
                return `${deletable.length} od ${selectedCollections.length} kolekcija će biti obrisano.${skippedCount > 0 ? ` ${skippedCount} kolekcija na aukciji će biti preskočeno.` : ""} Ova akcija se ne može poništiti.`;
            })(),
            actionText: COLLECTION_DIALOG_I18N.bulkDelete[language].actionText,
            onAction: bulkActions.handleBulkDeleteConfirm,
            actionClassName: COLLECTION_DIALOG_I18N.bulkDelete[language].actionClassName,
        },
        bulkStatus: {
            title: COLLECTION_DIALOG_I18N.bulkStatus[language].title,
            description: language === "en"
                ? `You are about to change the status of ${selectedCollections.length} collections to "${statusOptions.find((o) => o.value === bulkStatus)?.labelEn}".`
                : `Upravo ćete promeniti status ${selectedCollections.length} kolekcija u "${statusOptions.find((o) => o.value === bulkStatus)?.labelSr}".`,
            actionText: COLLECTION_DIALOG_I18N.bulkStatus[language].actionText,
            onAction: bulkActions.handleBulkStatusConfirm,
        },
        auctionRemoval: {
            title: COLLECTION_DIALOG_I18N.auctionRemoval[language].title,
            description: (() => {
                if (!pendingStatusChange) return "";
                const parentAuction = auctions.find((a) => (a.collectionIds || []).includes(pendingStatusChange.collection.id));
                const auctionName = parentAuction ? (language === "en" ? parentAuction.title.en : parentAuction.title.sr) : "";
                const collectionName = language === "en" ? pendingStatusChange.collection.name.en : pendingStatusChange.collection.name.sr;
                return language === "en"
                    ? `"${collectionName}" will be removed from auction "${auctionName}". This action cannot be undone.`
                    : `"${collectionName}" će biti uklonjen sa aukcije "${auctionName}". Ova akcija se ne može poništiti.`;
            })(),
            actionText: COLLECTION_DIALOG_I18N.auctionRemoval[language].actionText,
            onAction: actions.executeStatusChange,
            actionClassName: COLLECTION_DIALOG_I18N.auctionRemoval[language].actionClassName,
        },
        inlineStatus: {
            title: COLLECTION_DIALOG_I18N.inlineStatus[language].title,
            description: language === "en"
                ? `Change status of "${pendingStatusChange?.collection.name.en}" from "${statusOptions.find((o) => o.value === pendingStatusChange?.collection.status)?.labelEn}" to "${statusOptions.find((o) => o.value === pendingStatusChange?.newStatus)?.labelEn}"?`
                : `Promeniti status kolekcije "${pendingStatusChange?.collection.name.sr}" iz "${statusOptions.find((o) => o.value === pendingStatusChange?.collection.status)?.labelSr}" u "${statusOptions.find((o) => o.value === pendingStatusChange?.newStatus)?.labelSr}"?`,
            actionText: COLLECTION_DIALOG_I18N.inlineStatus[language].actionText,
            onAction: actions.handleConfirmInlineStatusChange,
        },
        create: {
            title: language === "en" ? "Create Collection?" : "Kreirati Kolekciju?",
            description: language === "en" ? "Are you sure you want to create this collection?" : "Da li ste sigurni da želite da kreirate ovu kolekciju?",
            actionText: language === "en" ? "Create" : "Kreiraj",
            onAction: () => { },
        },
        update: {
            title: language === "en" ? "Update Collection?" : "Ažurirati Kolekciju?",
            description: language === "en" ? "Are you sure you want to update this collection?" : "Da li ste sigurni da želite da ažurirate ovu kolekciju?",
            actionText: language === "en" ? "Update" : "Ažuriraj",
            onAction: () => { },
        },
    };
};

export const buildCollectionDialogConfig = (
    language: "en" | "sr",
    actions: CollectionActions,
    bulkActions: CollectionBulkActions,
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[],
    auctions: Auction[]
): Partial<Record<CollectionDialogKey, CollectionDialogConfig>> => {
    const handlers = getActionHandlers(actions, bulkActions);
    const dynamicConfigs = getDynamicDialogConfigs(language, actions, bulkActions, statusOptions, auctions);

    const staticConfigs = (Object.keys(COLLECTION_DIALOG_I18N) as CollectionStaticDialogKey[]).reduce((acc, key) => {
        const i18n = COLLECTION_DIALOG_I18N[key][language];
        acc[key] = {
            ...i18n,
            onAction: handlers[key],
        } as CollectionDialogConfig;
        return acc;
    }, {} as Record<CollectionStaticDialogKey, CollectionDialogConfig>);

    return {
        ...staticConfigs,
        ...dynamicConfigs,
    };
};
