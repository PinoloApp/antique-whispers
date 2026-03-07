import React from "react";
import { useAdminUsersContext } from "@/contexts/AdminUsersContext";
import { UserViewDialog } from "./UserViewDialog";
import UserFormDialog from "./UserFormDialog";
import ReusableAlertDialog from "../ReusableAlertDialog";
import { buildUserDialogConfig } from "../config/userDialogConfig";

interface UserDialogsProps {
    language: "en" | "sr";
}

export const UserDialogs: React.FC<UserDialogsProps> = ({ language }) => {
    const actions = useAdminUsersContext();
    const { dialogState } = actions;

    const dialogConfig = buildUserDialogConfig(language, actions);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            dialogState.close();
        }
    };

    // Find if any alert dialog is open
    const activeAlertKey = (Object.keys(dialogConfig) as Array<keyof typeof dialogConfig>).find(
        (key) => dialogState.isOpen(key as any)
    );

    const currentAlertConfig = activeAlertKey ? dialogConfig[activeAlertKey] : undefined;

    return (
        <>
            {/* Form Dialogs */}
            <UserFormDialog
                mode="create"
                isOpen={dialogState.isOpen("create")}
                onOpenChange={handleOpenChange}
                onConfirmOpen={() => dialogState.open("createConfirm")}
                formData={actions.formData}
                setFormData={actions.setFormData}
                formTouched={actions.formTouched}
                markFormTouched={actions.markFormTouched}
                handleFormSubmit={actions.handleFormSubmit}
                formErrors={{
                    firstName: actions.formErrors?.firstName || null,
                    lastName: actions.formErrors?.lastName || null,
                    email: actions.formErrors?.email || null,
                    phone: actions.formErrors?.phone || null,
                }}
                isMutating={actions.isMutating}
            />

            <UserFormDialog
                mode="edit"
                isOpen={dialogState.isOpen("edit")}
                onOpenChange={handleOpenChange}
                onConfirmOpen={() => dialogState.open("editConfirm")}
                formData={actions.formData}
                setFormData={actions.setFormData}
                formTouched={actions.formTouched}
                markFormTouched={actions.markFormTouched}
                handleFormSubmit={actions.handleFormSubmit}
                formErrors={{
                    firstName: actions.formErrors?.firstName || null,
                    lastName: actions.formErrors?.lastName || null,
                    email: actions.formErrors?.email || null,
                    phone: actions.formErrors?.phone || null,
                }}
                isMutating={actions.isMutating}
            />

            {/* View Dialog */}
            <UserViewDialog
                isOpen={dialogState.isOpen("view")}
                onOpenChange={handleOpenChange}
                user={actions.selectedUser}
                onClose={() => dialogState.close()}
                onEdit={actions.openEditDialog}
            />

            {/* Alert Dialogs */}
            <ReusableAlertDialog
                open={!!currentAlertConfig}
                onOpenChange={handleOpenChange}
                title={currentAlertConfig?.title || ""}
                description={currentAlertConfig?.description || ""}
                onAction={currentAlertConfig?.onAction || (() => { })}
                actionText={currentAlertConfig?.actionText || ""}
                actionClassName={currentAlertConfig?.actionClassName}
                cancelText={currentAlertConfig?.cancelText}
                icon={currentAlertConfig?.icon}
                isMutating={currentAlertConfig?.isMutating}
            />
        </>
    );
};
