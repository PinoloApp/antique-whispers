import { useState, useCallback, useMemo, Dispatch, SetStateAction } from "react";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { AdminUserModalsState } from "@/hooks/useModalState";
import { useUserActions } from "@/hooks/useUserActions";
import { toast } from "@/hooks/use-toast";
import { getFieldError, nameRules, emailRules, phoneRules } from "@/lib/validation";

export interface AdminUsersFormData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
}

export interface UseAdminUsersContextValueProps {
    users: User[];
    addUser: (user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    changeUserStatus: (id: string, status: UserStatus) => Promise<void>;
    changeUserRole: (id: string, role: UserRole) => Promise<void>;
    getAdminCount: () => number;
    dialogState: AdminUserModalsState;
    t: (key: string) => string;
}

export const useAdminUsersContextValue = ({
    users, addUser, updateUser, deleteUser, changeUserStatus, changeUserRole, getAdminCount, dialogState, t
}: UseAdminUsersContextValueProps) => {

    const [isMutating, setIsMutating] = useState(false);

    const userActions = useUserActions({
        users,
        deleteUser,
        changeUserStatus,
        changeUserRole,
        getAdminCount,
        language: "en",
        dialogState,
        setIsMutating
    });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [pendingRoleChange, setPendingRoleChange] = useState<UserRole | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<UserStatus | null>(null);

    const [formData, setFormData] = useState<AdminUsersFormData>({
        email: "", firstName: "", lastName: "", phone: "", role: "user", status: "active",
    });

    const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

    const markFormTouched = useCallback((field: string) => setFormTouched((prev) => ({ ...prev, [field]: true })), []);

    const resetForm = useCallback(() => {
        setFormData({ email: "", firstName: "", lastName: "", phone: "", role: "user", status: "active" });
        setSelectedUser(null);
        setFormTouched({});
    }, []);

    const handleCreateConfirm = useCallback(async () => {
        setIsMutating(true);
        try {
            const newUser: User = {
                id: Date.now().toString(),
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
                role: formData.role,
                status: formData.status,
                createdAt: new Date(),
                totalBids: 0,
                wonAuctions: 0,
            };
            await addUser(newUser);
            dialogState.close();
            resetForm();
            toast({ title: t("userCreated"), description: t("userCreatedDesc") });
        } catch (error) {
            toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [formData, addUser, resetForm, t, dialogState]);

    const handleEditConfirm = useCallback(async () => {
        if (!selectedUser) return;
        setIsMutating(true);
        try {
            await updateUser({ ...selectedUser, ...formData });
            dialogState.close();
            resetForm();
            toast({ title: t("userUpdated"), description: t("userUpdatedDesc") });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [selectedUser, formData, updateUser, resetForm, t, dialogState]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedUser) return;
        if (selectedUser.role === "admin" && getAdminCount() <= 1) {
            toast({ title: t("actionNotAllowed"), description: t("cannotDeleteOnlyAdmin"), variant: "destructive" });
            dialogState.close();
            return;
        }
        setIsMutating(true);
        try {
            await deleteUser(selectedUser.id);
            dialogState.close();
            setSelectedUser(null);
            toast({ title: t("userDeleted"), description: t("userDeletedDesc") });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [selectedUser, deleteUser, getAdminCount, t, dialogState]);

    const handleStatusChangeConfirm = useCallback(async () => {
        if (!selectedUser || !pendingStatusChange) return;
        setIsMutating(true);
        try {
            await changeUserStatus(selectedUser.id, pendingStatusChange);
            dialogState.close();
            setPendingStatusChange(null);
            setSelectedUser(null);
            toast({ title: t("statusUpdated"), description: t("statusUpdatedDesc") });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [selectedUser, pendingStatusChange, changeUserStatus, t, dialogState]);

    const handleRoleChangeConfirm = useCallback(async () => {
        if (!selectedUser || !pendingRoleChange) return;
        if (selectedUser.role === "admin" && pendingRoleChange !== "admin" && getAdminCount() <= 1) {
            toast({ title: t("actionNotAllowed"), description: t("cannotChangeOnlyAdmin"), variant: "destructive" });
            dialogState.close();
            return;
        }
        setIsMutating(true);
        try {
            await changeUserRole(selectedUser.id, pendingRoleChange);
            dialogState.close();
            setPendingRoleChange(null);
            setSelectedUser(null);
            toast({ title: t("roleUpdated"), description: t("roleUpdatedDesc") });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [selectedUser, pendingRoleChange, changeUserRole, getAdminCount, t, dialogState]);

    const openBanDialog = useCallback((user: User, status: UserStatus) => {
        if (status === "banned" && user.role === "admin") {
            toast({ title: t("actionNotAllowed"), description: t("cannotBanAdmin"), variant: "destructive" });
            return;
        }
        if (status === "banned" && user.status === "banned") {
            toast({ title: t("actionNotAllowed"), description: t("alreadyBanned"), variant: "destructive" });
            return;
        }
        if (status === "active" && user.status === "active") {
            toast({ title: t("actionNotAllowed"), description: t("alreadyActive"), variant: "destructive" });
            return;
        }
        setSelectedUser(user);
        setPendingStatusChange(status);
        dialogState.open("ban");
    }, [t, dialogState]);

    const openRoleChangeDialog = useCallback((user: User, role: UserRole) => {
        if (user.role === "admin" && role === "admin") {
            toast({ title: t("actionNotAllowed"), description: t("alreadyAdmin"), variant: "destructive" });
            return;
        }
        if (user.role === "admin" && role !== "admin" && getAdminCount() === 1) {
            toast({ title: t("actionNotAllowed"), description: t("cannotChangeOnlyAdmin"), variant: "destructive" });
            return;
        }
        setSelectedUser(user);
        setPendingRoleChange(role);
        dialogState.open("roleChange");
    }, [getAdminCount, t, dialogState]);

    const openEditDialog = useCallback((user: User) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || "",
            role: user.role,
            status: user.status,
        });
        dialogState.open("edit");
    }, [dialogState]);

    const openViewDialog = useCallback((user: User) => {
        setSelectedUser(user);
        dialogState.open("view");
    }, [dialogState]);

    const openDeleteDialog = useCallback((user: User) => {
        if (user.role === "admin" && getAdminCount() === 1) {
            toast({ title: t("actionNotAllowed"), description: t("cannotDeleteOnlyAdmin"), variant: "destructive" });
            return;
        }
        setSelectedUser(user);
        dialogState.open("delete");
    }, [getAdminCount, t, dialogState]);

    const handleFormSubmit = useCallback((e: React.FormEvent, onSuccess: () => void) => {
        e.preventDefault();
        setFormTouched({ firstName: true, lastName: true, email: true, phone: true });
        const language = "en";
        const fnErr = getFieldError(formData.firstName, nameRules, language);
        const lnErr = getFieldError(formData.lastName, nameRules, language);
        const emErr = getFieldError(formData.email, emailRules, language);
        const phErr = getFieldError(formData.phone, phoneRules, language);
        if (fnErr || lnErr || emErr || phErr) return;
        onSuccess();
    }, [formData]);

    const bannableUsersLength = useMemo(() => userActions.getBannableUsers().length, [userActions]);
    const unbannableUsersLength = useMemo(() => userActions.getUnbannableUsers().length, [userActions]);
    const roleChangeableUsersLength = useMemo(
        () => userActions.getRoleChangeableUsers(userActions.bulkRoleTarget).length,
        [userActions, userActions.bulkRoleTarget]
    );

    const formErrors = useMemo(() => {
        const lang = "en";
        return {
            firstName: formTouched.firstName ? getFieldError(formData.firstName, nameRules, lang) : null,
            lastName: formTouched.lastName ? getFieldError(formData.lastName, nameRules, lang) : null,
            email: formTouched.email ? getFieldError(formData.email, emailRules, lang) : null,
            phone: formTouched.phone ? getFieldError(formData.phone, phoneRules, lang) : null,
        };
    }, [formTouched, formData]);

    const contextValue = useMemo(() => ({
        dialogState,
        selectedUser,
        pendingStatusChange,
        pendingRoleChange,
        bulkRoleTarget: userActions.bulkRoleTarget,
        selectedUsersLength: userActions.selectedUsers.length,
        formData,
        setFormData,
        formTouched,
        markFormTouched,
        handleFormSubmit,
        formErrors,
        openEditDialog,
        openBanDialog,
        openRoleChangeDialog,
        openViewDialog,
        openDeleteDialog,
        resetForm,
        handleCreate: handleCreateConfirm,
        handleEdit: handleEditConfirm,
        handleDelete: handleDeleteConfirm,
        handleStatusChange: handleStatusChangeConfirm,
        handleRoleChange: handleRoleChangeConfirm,
        confirmBulkDelete: userActions.confirmBulkDelete,
        confirmBulkBan: userActions.confirmBulkBan,
        confirmBulkUnban: userActions.confirmBulkUnban,
        confirmBulkRoleChange: userActions.confirmBulkRoleChange,
        selectedUsers: userActions.selectedUsers,
        handleSelectUser: userActions.handleSelectUser,
        handleSelectAll: userActions.handleSelectAll,
        handleBulkBan: userActions.handleBulkBan,
        handleBulkUnban: userActions.handleBulkUnban,
        handleBulkDelete: userActions.handleBulkDelete,
        openBulkRoleChangeDialog: userActions.openBulkRoleChangeDialog,
        bannableUsersLength,
        unbannableUsersLength,
        roleChangeableUsersLength,
        isMutating,
    }), [
        dialogState, selectedUser, pendingStatusChange, pendingRoleChange, userActions,
        formData, formTouched, markFormTouched, handleFormSubmit, formErrors, openEditDialog, openBanDialog, openRoleChangeDialog,
        openViewDialog, openDeleteDialog, resetForm, handleCreateConfirm, handleEditConfirm, handleDeleteConfirm,
        handleStatusChangeConfirm, handleRoleChangeConfirm, bannableUsersLength, unbannableUsersLength, roleChangeableUsersLength, isMutating
    ]);

    return contextValue;
};
