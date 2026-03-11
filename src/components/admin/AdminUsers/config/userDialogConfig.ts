import { useAdminUsersContext } from "@/contexts/AdminUsersContext";
import {
    UserDialogKey,
    UserStaticDialogKey,
    UserDialogConfig,
} from "./userDialogTypes";
import { USER_DIALOG_I18N } from "./userDialogI18n";

type UserActions = ReturnType<typeof useAdminUsersContext>;

const getActionHandlers = (
    actions: UserActions
): Record<UserStaticDialogKey, () => void> => ({
    createConfirm: actions.handleCreate,
    editConfirm: actions.handleEdit,
    delete: actions.handleDelete,
    ban: actions.handleStatusChange,
    unban: actions.handleStatusChange,
    roleChange: actions.handleRoleChange,
    bulkDelete: actions.confirmBulkDelete,
    bulkBan: actions.confirmBulkBan,
    bulkUnban: actions.confirmBulkUnban,
    bulkRoleChange: actions.confirmBulkRoleChange,
});

const getDynamicDialogConfigs = (
    language: "en" | "sr",
    actions: UserActions
): Partial<Record<UserDialogKey, UserDialogConfig>> => {
    const {
        formData,
        selectedUser,
        pendingStatusChange,
        pendingRoleChange,
        selectedUsersLength,
        bannableUsersLength,
        unbannableUsersLength,
        roleChangeableUsersLength,
        bulkRoleTarget,
    } = actions;

    const t = (key: string) => {
        // Simple fallback for local translations if needed, but mostly we use i18n file
        return key;
    };

    return {
        createConfirm: {
            title: USER_DIALOG_I18N.createConfirm[language].title,
            description: language === "en"
                ? `Are you sure you want to create user "${formData.firstName} ${formData.lastName}" with email "${formData.email}"?`
                : `Da li ste sigurni da želite da kreirate korisnika "${formData.firstName} ${formData.lastName}" sa email adresom "${formData.email}"?`,
            actionText: USER_DIALOG_I18N.createConfirm[language].actionText,
            onAction: actions.handleCreate,
        },
        editConfirm: {
            title: USER_DIALOG_I18N.editConfirm[language].title,
            description: language === "en"
                ? `Are you sure you want to save changes for ${formData.firstName} ${formData.lastName}?`
                : `Da li ste sigurni da želite da sačuvate izmene za ${formData.firstName} ${formData.lastName}?`,
            actionText: USER_DIALOG_I18N.editConfirm[language].actionText,
            onAction: actions.handleEdit,
        },
        delete: {
            title: USER_DIALOG_I18N.delete[language].title,
            description: language === "en"
                ? `Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`
                : `Da li ste sigurni da želite da obrišete korisnika ${selectedUser?.firstName} ${selectedUser?.lastName}? Ova akcija se ne može poništiti.`,
            actionText: USER_DIALOG_I18N.delete[language].actionText,
            onAction: actions.handleDelete,
            actionClassName: USER_DIALOG_I18N.delete[language].actionClassName,
        },
        ban: {
            title: USER_DIALOG_I18N.ban[language].title,
            description: language === "en"
                ? `Are you sure you want to ban ${selectedUser?.firstName} ${selectedUser?.lastName}? They will be unable to log in.`
                : `Da li ste sigurni da želite da banujete korisnika ${selectedUser?.firstName} ${selectedUser?.lastName}? Neće moći da se prijavi.`,
            actionText: USER_DIALOG_I18N.ban[language].actionText,
            onAction: actions.handleStatusChange,
            actionClassName: USER_DIALOG_I18N.ban[language].actionClassName,
        },
        unban: {
            title: USER_DIALOG_I18N.unban[language].title,
            description: language === "en"
                ? `Are you sure you want to unban ${selectedUser?.firstName} ${selectedUser?.lastName}?`
                : `Da li ste sigurni da želite da debanujete korisnika ${selectedUser?.firstName} ${selectedUser?.lastName}?`,
            actionText: USER_DIALOG_I18N.unban[language].actionText,
            onAction: actions.handleStatusChange,
            actionClassName: USER_DIALOG_I18N.unban[language].actionClassName,
        },
        roleChange: {
            title: USER_DIALOG_I18N.roleChange[language].title,
            description: language === "en"
                ? `Change role for ${selectedUser?.firstName} ${selectedUser?.lastName} to ${pendingRoleChange === "admin" ? "Admin" : "User"}?`
                : `Promeniti ulogu za ${selectedUser?.firstName} ${selectedUser?.lastName} u ${pendingRoleChange === "admin" ? "Administrator" : "Korisnik"}?`,
            actionText: USER_DIALOG_I18N.roleChange[language].actionText,
            onAction: actions.handleRoleChange,
        },
        bulkDelete: {
            title: USER_DIALOG_I18N.bulkDelete[language].title,
            description: language === "en"
                ? `Are you sure you want to delete ${selectedUsersLength} selected users? This action cannot be undone.`
                : `Da li ste sigurni da želite da obrišete ${selectedUsersLength} izabranih korisnika? Ova akcija se ne može poništiti.`,
            actionText: USER_DIALOG_I18N.bulkDelete[language].actionText,
            onAction: actions.confirmBulkDelete,
            actionClassName: USER_DIALOG_I18N.bulkDelete[language].actionClassName,
        },
        bulkBan: {
            title: USER_DIALOG_I18N.bulkBan[language].title,
            description: (() => {
                const skipped = selectedUsersLength - bannableUsersLength;
                if (language === "en") {
                    const baseDesc = `${bannableUsersLength} of ${selectedUsersLength} users will be banned.`;
                    return skipped > 0 ? `${baseDesc} ${skipped} will be skipped (admins or already banned).` : baseDesc;
                } else {
                    const baseDesc = `${bannableUsersLength} od ${selectedUsersLength} korisnika će biti banovano.`;
                    return skipped > 0 ? `${baseDesc} ${skipped} će biti preskočeno (administratori ili već banovani).` : baseDesc;
                }
            })(),
            actionText: USER_DIALOG_I18N.bulkBan[language].actionText,
            onAction: actions.confirmBulkBan,
            actionClassName: USER_DIALOG_I18N.bulkBan[language].actionClassName,
        },
        bulkUnban: {
            title: USER_DIALOG_I18N.bulkUnban[language].title,
            description: (() => {
                const skipped = selectedUsersLength - unbannableUsersLength;
                if (language === "en") {
                    const baseDesc = `${unbannableUsersLength} of ${selectedUsersLength} users will be unbanned.`;
                    return skipped > 0 ? `${baseDesc} ${skipped} will be skipped (already active).` : baseDesc;
                } else {
                    const baseDesc = `${unbannableUsersLength} od ${selectedUsersLength} korisnika će biti debanovano.`;
                    return skipped > 0 ? `${baseDesc} ${skipped} će biti preskočeno (već aktivni).` : baseDesc;
                }
            })(),
            actionText: USER_DIALOG_I18N.bulkUnban[language].actionText,
            onAction: actions.confirmBulkUnban,
            actionClassName: USER_DIALOG_I18N.bulkUnban[language].actionClassName,
        },
        bulkRoleChange: {
            title: USER_DIALOG_I18N.bulkRoleChange[language].title,
            description: (() => {
                const skipped = selectedUsersLength - roleChangeableUsersLength;
                const role = bulkRoleTarget === "admin" ? (language === "en" ? "Admin" : "Administrator") : (language === "en" ? "User" : "Korisnik");
                if (language === "en") {
                    const baseDesc = `${roleChangeableUsersLength} of ${selectedUsersLength} users will be changed to ${role}.`;
                    return skipped > 0 ? `${baseDesc} ${skipped} will be skipped (already ${role.toLowerCase()}).` : baseDesc;
                } else {
                    const baseDesc = `${roleChangeableUsersLength} od ${selectedUsersLength} korisnika će dobiti ulogu ${role}.`;
                    return skipped > 0 ? `${baseDesc} ${skipped} će biti preskočeno (već su ${role.toLowerCase()}).` : baseDesc;
                }
            })(),
            actionText: USER_DIALOG_I18N.bulkRoleChange[language].actionText,
            onAction: actions.confirmBulkRoleChange,
        },
    };
};

export const buildUserDialogConfig = (
    language: "en" | "sr",
    actions: UserActions
): Partial<Record<UserDialogKey, UserDialogConfig>> => {
    const handlers = getActionHandlers(actions);
    const dynamicConfigs = getDynamicDialogConfigs(language, actions);

    const staticConfigs = (Object.keys(USER_DIALOG_I18N) as UserStaticDialogKey[]).reduce((acc, key) => {
        const i18n = USER_DIALOG_I18N[key][language];
        acc[key] = {
            ...i18n,
            onAction: handlers[key],
            isMutating: actions.isMutating,
        } as UserDialogConfig;
        return acc;
    }, {} as Record<UserStaticDialogKey, UserDialogConfig>);

    const merged = {
        ...staticConfigs,
        ...dynamicConfigs,
    };

    // Ensure isMutating is applied to all configs even if dynamicConfigs overwrote them
    (Object.keys(merged) as UserDialogKey[]).forEach((key) => {
        const config = merged[key];
        if (config) {
            config.isMutating = actions.isMutating;
        }
    });

    return merged;
};
