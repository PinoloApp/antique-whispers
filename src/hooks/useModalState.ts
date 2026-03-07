import { useState, useCallback } from "react";

export type ModalKey =
    | "create" | "createConfirm"
    | "edit" | "editConfirm"
    | "view" | "delete" | "ban"
    | "roleChange" | "bulkDelete"
    | "bulkBan" | "bulkUnban" | "bulkRoleChange";

export const useModalState = () => {
    const [openModal, setOpenModal] = useState<ModalKey | null>(null);

    const open = useCallback((key: ModalKey) => setOpenModal(key), []);
    const close = useCallback(() => setOpenModal(null), []);
    const isOpen = useCallback((key: ModalKey) => openModal === key, [openModal]);

    return { open, close, isOpen };
};

export type AdminUserModalsState = ReturnType<typeof useModalState>;
