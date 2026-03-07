import { useState, useCallback } from "react";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { toast } from "@/hooks/use-toast";
import { AdminUserModalsState } from "./useModalState";

interface UseUserActionsProps {
    users: User[];
    deleteUser: (id: string) => Promise<void>;
    changeUserStatus: (id: string, status: UserStatus) => Promise<void>;
    changeUserRole: (id: string, role: UserRole) => Promise<void>;
    getAdminCount: () => number;
    language: "en" | "sr";
    dialogState: AdminUserModalsState;
    setIsMutating: (val: boolean) => void;
}

export const useUserActions = ({ users, deleteUser, changeUserStatus, changeUserRole, getAdminCount, language, dialogState, setIsMutating }: UseUserActionsProps) => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [bulkRoleTarget, setBulkRoleTarget] = useState<UserRole>("user");

    const getSelectedUserObjects = useCallback(
        () => users.filter((u) => selectedUsers.includes(u.id)),
        [users, selectedUsers]
    );

    const handleSelectUser = useCallback((userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, userId]);
        } else {
            setSelectedUsers((prev) => prev.filter((id) => id !== userId));
        }
    }, []);

    const handleSelectAll = useCallback((filteredIds: string[], checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredIds);
        } else {
            setSelectedUsers([]);
        }
    }, []);

    const handleBulkDelete = useCallback(() => {
        const selected = getSelectedUserObjects();
        const adminCount = getAdminCount();
        const selectedAdminCount = selected.filter((u) => u.role === "admin").length;
        if (selectedAdminCount > 0 && adminCount - selectedAdminCount < 1) {
            toast({
                title: language === "en" ? "Action Not Allowed" : "Akcija nije dozvoljena",
                description: language === "en"
                    ? "Cannot delete all admins. At least one admin must remain."
                    : "Nije moguće obrisati sve administratore. Barem jedan administrator mora ostati.",
                variant: "destructive",
            });
            return;
        }
        dialogState.open("bulkDelete");
    }, [getSelectedUserObjects, getAdminCount, language, dialogState]);

    const confirmBulkDelete = useCallback(async () => {
        setIsMutating(true);
        try {
            await Promise.all(selectedUsers.map(id => deleteUser(id)));
            toast({
                title: language === "en" ? "Users Deleted" : "Korisnici Obrisani",
                description: language === "en" ? `${selectedUsers.length} users deleted.` : `${selectedUsers.length} korisnika obrisano.`,
            });
            setSelectedUsers([]);
            dialogState.close();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete users.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [selectedUsers, deleteUser, language, dialogState, setIsMutating]);

    // Bulk Ban
    const getBannableUsers = useCallback(() => {
        const selected = getSelectedUserObjects();
        return selected.filter((u) => u.role !== "admin" && u.status !== "banned");
    }, [getSelectedUserObjects]);

    const handleBulkBan = useCallback(() => {
        const bannable = getBannableUsers();
        if (bannable.length === 0) {
            toast({
                title: language === "en" ? "Action Not Allowed" : "Akcija nije dozvoljena",
                description: language === "en"
                    ? "None of the selected users can be banned. Admins and already banned users are excluded."
                    : "Nijedan od selektovanih korisnika ne može biti banovan. Administratori i već banovani korisnici su isključeni.",
                variant: "destructive",
            });
            return;
        }
        dialogState.open("bulkBan");
    }, [getBannableUsers, language, dialogState]);

    const confirmBulkBan = useCallback(async () => {
        setIsMutating(true);
        const bannable = getBannableUsers();
        const bannableIds = bannable.map((u) => u.id);

        try {
            await Promise.all(bannableIds.map(id => changeUserStatus(id, "banned")));
            const skipped = selectedUsers.length - bannable.length;
            toast({
                title: language === "en" ? "Users Banned" : "Korisnici Banovani",
                description: language === "en"
                    ? `${bannable.length} users banned.${skipped > 0 ? ` ${skipped} skipped (admins or already banned).` : ""}`
                    : `${bannable.length} korisnika banovano.${skipped > 0 ? ` ${skipped} preskočeno (administratori ili već banovani).` : ""}`,
            });
            setSelectedUsers([]);
            dialogState.close();
        } catch (error) {
            toast({ title: "Error", description: "Failed to ban users.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [getBannableUsers, selectedUsers.length, changeUserStatus, language, dialogState, setIsMutating]);

    // Bulk Unban
    const getUnbannableUsers = useCallback(() => {
        const selected = getSelectedUserObjects();
        return selected.filter((u) => u.status === "banned");
    }, [getSelectedUserObjects]);

    const handleBulkUnban = useCallback(() => {
        const unbannable = getUnbannableUsers();
        if (unbannable.length === 0) {
            toast({
                title: language === "en" ? "Action Not Allowed" : "Akcija nije dozvoljena",
                description: language === "en"
                    ? "None of the selected users can be unbanned. Only banned users can be unbanned."
                    : "Nijedan od selektovanih korisnika ne može biti odbanovan. Samo banovani korisnici mogu biti odbanovani.",
                variant: "destructive",
            });
            return;
        }
        dialogState.open("bulkUnban");
    }, [getUnbannableUsers, language, dialogState]);

    const confirmBulkUnban = useCallback(async () => {
        setIsMutating(true);
        const unbannable = getUnbannableUsers();
        const unbannableIds = unbannable.map((u) => u.id);

        try {
            await Promise.all(unbannableIds.map(id => changeUserStatus(id, "active")));
            const skipped = selectedUsers.length - unbannable.length;
            toast({
                title: language === "en" ? "Users Unbanned" : "Korisnici Odbanovani",
                description: language === "en"
                    ? `${unbannable.length} users unbanned.${skipped > 0 ? ` ${skipped} skipped (already active).` : ""}`
                    : `${unbannable.length} korisnika odbanovano.${skipped > 0 ? ` ${skipped} preskočeno (već aktivni).` : ""}`,
            });
            setSelectedUsers([]);
            dialogState.close();
        } catch (error) {
            toast({ title: "Error", description: "Failed to unban users.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [getUnbannableUsers, selectedUsers.length, changeUserStatus, language, dialogState, setIsMutating]);

    // Bulk Role Change
    const getRoleChangeableUsers = useCallback(
        (targetRole: UserRole) => {
            const selected = getSelectedUserObjects();
            return selected.filter((u) => u.role !== targetRole);
        },
        [getSelectedUserObjects]
    );

    const openBulkRoleChangeDialog = useCallback(
        (role: UserRole) => {
            const changeable = getRoleChangeableUsers(role);
            if (changeable.length === 0) {
                toast({
                    title: language === "en" ? "Action Not Allowed" : "Akcija nije dozvoljena",
                    description: language === "en"
                        ? `All selected users already have the ${role === "admin" ? "Admin" : "User"} role.`
                        : `Svi selektovani korisnici već imaju ulogu ${role === "admin" ? "Admin" : "Korisnik"}.`,
                    variant: "destructive",
                });
                return;
            }
            const selected = getSelectedUserObjects();
            const soleAdmin = selected.some((u) => u.role === "admin" && role !== "admin" && getAdminCount() === 1);
            if (soleAdmin) {
                toast({
                    title: language === "en" ? "Action Not Allowed" : "Akcija nije dozvoljena",
                    description: language === "en"
                        ? "Cannot change the role of the only admin. Please assign another admin first."
                        : "Nije moguće promeniti ulogu jedinog administratora. Prvo dodelite ulogu administratora drugom korisniku.",
                    variant: "destructive",
                });
                return;
            }
            setBulkRoleTarget(role);
            dialogState.open("bulkRoleChange");
        },
        [getRoleChangeableUsers, getSelectedUserObjects, getAdminCount, language, dialogState]
    );

    const confirmBulkRoleChange = useCallback(async () => {
        const changeable = getRoleChangeableUsers(bulkRoleTarget);
        if (bulkRoleTarget !== "admin") {
            const adminCount = getAdminCount();
            const adminsBeingDemoted = changeable.filter((u) => u.role === "admin").length;
            if (adminsBeingDemoted > 0 && adminCount - adminsBeingDemoted < 1) {
                toast({
                    title: language === "en" ? "Action Not Allowed" : "Akcija nije dozvoljena",
                    description: language === "en"
                        ? "Cannot demote all admins. At least one admin must remain."
                        : "Nije moguće ukloniti ulogu svim administratorima. Barem jedan administrator mora ostati.",
                    variant: "destructive",
                });
                dialogState.close();
                return;
            }
        }
        setIsMutating(true);
        const changeableIds = changeable.map((u) => u.id);

        try {
            await Promise.all(changeableIds.map(id => changeUserRole(id, bulkRoleTarget)));
            const skipped = selectedUsers.length - changeable.length;
            toast({
                title: language === "en" ? "Roles Updated" : "Uloge Ažurirane",
                description: language === "en"
                    ? `${changeable.length} users updated to ${bulkRoleTarget === "admin" ? "Admin" : "User"}.${skipped > 0 ? ` ${skipped} skipped (already ${bulkRoleTarget === "admin" ? "admin" : "user"}).` : ""}`
                    : `${changeable.length} korisnika ažurirano na ${bulkRoleTarget === "admin" ? "Admin" : "Korisnik"}.${skipped > 0 ? ` ${skipped} preskočeno (već ${bulkRoleTarget === "admin" ? "admin" : "korisnik"}).` : ""}`,
            });
            setSelectedUsers([]);
            dialogState.close();
        } catch (error) {
            toast({ title: "Error", description: "Failed to change user roles.", variant: "destructive" });
        } finally {
            setIsMutating(false);
        }
    }, [getRoleChangeableUsers, bulkRoleTarget, selectedUsers.length, changeUserRole, language, dialogState, setIsMutating]);

    return {
        selectedUsers,
        setSelectedUsers,
        bulkRoleTarget,
        handleSelectUser,
        handleSelectAll,
        handleBulkDelete,
        confirmBulkDelete,
        handleBulkBan,
        confirmBulkBan,
        handleBulkUnban,
        confirmBulkUnban,
        openBulkRoleChangeDialog,
        confirmBulkRoleChange,
        getBannableUsers,
        getUnbannableUsers,
        getRoleChangeableUsers,
    };
};
