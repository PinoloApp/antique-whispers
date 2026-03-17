import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useUserFilters } from "@/hooks/useUserFilters";
import { useModalState } from "@/hooks/useModalState";
import { AdminUsersProvider, useAdminUsersContext } from "@/contexts/AdminUsersContext";
import { User } from "@/types/adminUsers.types";
import AdminUsersTable from "./AdminUsersTable";
import AdminUserCard from "./AdminUserCard";
import AdminUserModals from "./AdminUserModals";
import { Shield, Plus, Loader2, Ban, CheckCircle, Trash2, ShieldCheck, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaginationLabel } from "@/utils/adminUsers.utils";
import TitleHeader from "../AdminComponents/TitleHeader";
import { useCallback, useMemo } from "react";
import NoData from "../AdminComponents/NoData";
import { FILTER_CONFIG } from "../config";
import { SelectFilterConfig } from "../AdminComponents/filters/types";
import CategoryFilters from "../AdminCategories/components/CategoryFilters";
import NoSearchFound from "../AdminComponents/filters/NoSearchFound";
import BulkActionsBar from "../AdminComponents/BulkActionsBar";
import PaginationControls from "../AdminComponents/Pagination";

const AdminUsersContent = ({ users }: { users: User[] }) => {
    const { t, language } = useLanguage();
    const {
        searchQuery, filterRole, filterStatus, currentPage, setCurrentPage, itemsPerPage,
        filteredUsers, paginatedUsers, totalPages, startIndex, endIndex,
        handleItemsPerPageChange, handleSearchChange, handleRoleFilterChange, handleStatusFilterChange
    } = useUserFilters(users);

    const {
        selectedUsers, handleSelectUser, handleSelectAll, handleBulkBan, handleBulkUnban, handleBulkDelete, openBulkRoleChangeDialog,
        openEditDialog, openBanDialog, openDeleteDialog, openRoleChangeDialog, openViewDialog, resetForm, dialogState,
        bannableUsersLength, unbannableUsersLength
    } = useAdminUsersContext();

    const allOnPageSelected = paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUsers.includes(u.id));

    const bulkActionHandlers: Record<string, () => void> = {
        handleBulkBan, handleBulkUnban, handleBulkDelete
    };

    const onCreate = useCallback(() => {
        resetForm();
        dialogState.open("create");
    }, []);

    const FILTERS = useMemo(() => {
        return {
            status: FILTER_CONFIG.userStatus(language),
            role: FILTER_CONFIG.userRole(language),
        }
    }, [language]);

    const selectFilters: SelectFilterConfig<any>[] = [
        {
            key: "userRole",
            value: filterRole,
            onChange: handleRoleFilterChange,
            placeholder: language === "en" ? "Filter by role" : "Filtriraj po ulozi",
            options: FILTERS.role,
        },
        {
            key: "userStatus",
            value: filterStatus,
            onChange: handleStatusFilterChange,
            placeholder: language === "en" ? "Filter by status" : "Filtriraj po statusu",
            options: FILTERS.status,
        }
    ];

    const bulkActions = [
        {
            icon: Ban,
            label: t('ban'),
            action: bulkActionHandlers.handleBulkBan,
            count: bannableUsersLength,
            className: "hover:bg-transparent hover:text-foreground",
            visible: bannableUsersLength > 0
        },
        {
            icon: CheckCircle,
            label: t('unban'),
            action: bulkActionHandlers.handleBulkUnban,
            count: unbannableUsersLength,
            className: "hover:bg-transparent hover:text-foreground",
            visible: unbannableUsersLength > 0
        },
        {
            icon: Trash2,
            label: t('delete'),
            action: bulkActionHandlers.handleBulkDelete,
            count: selectedUsers.length,
            className: "text-destructive hover:text-destructive hover:bg-transparent",
            visible: selectedUsers.length > 0,
        },
    ];

    const dropDownActions = [
        {
            icon: Shield,
            label: t('changeRole'),
            count: selectedUsers.length,
            options: [
                {
                    icon: ShieldCheck,
                    label: t('admin'),
                    value: "admin",
                    action: openBulkRoleChangeDialog,
                },
                {
                    icon: UserIcon,
                    label: t('user'),
                    value: "user",
                    action: openBulkRoleChangeDialog
                },
            ],
        },
    ];

    return (
        <div>
            <TitleHeader title={t("manageUsers")}>
                <Button onClick={onCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addUser")}
                </Button>
            </TitleHeader>
            {users.length === 0 ? (
                <NoData
                    icon="👥"
                    title={t("noUsersYet")}
                    description={t("createFirstUser")}
                    buttonText={t("addUser")}
                    buttonAction={onCreate}
                />
            ) : (
                <>
                    <CategoryFilters
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        selectFilters={selectFilters}
                        filteredCount={filteredUsers.length}
                        itemsFoundText={
                            filteredUsers.length === 1
                                ? (language === "en" ? "user found" : "korisnik pronađen")
                                : (language === "en" ? "users found" : "korisnika pronađeno")
                        }
                        placeholder={language === "en" ? "Search users..." : "Pretraži korisnike..."}
                    />
                    <BulkActionsBar
                        bulkActions={bulkActions}
                        totalSelected={selectedUsers.length}
                        showBar={selectedUsers.length > 0}
                        dropDownActions={dropDownActions}
                    />
                    {filteredUsers.length === 0 ? (
                        <NoSearchFound title={t("noUsersFound")} description={t("tryAdjustingSearch")} />
                    ) : (
                        <>
                            <div className="md:hidden space-y-4">
                                {paginatedUsers.map((user) => (
                                    <AdminUserCard
                                        key={user.id}
                                        user={user}
                                        isSelected={selectedUsers.includes(user.id)}
                                        onSelectUser={handleSelectUser}
                                        onView={openViewDialog}
                                        onEdit={openEditDialog}
                                        onBanStatusChange={openBanDialog}
                                        onDelete={openDeleteDialog}
                                    />
                                ))}
                            </div>
                            <AdminUsersTable
                                paginatedUsers={paginatedUsers}
                                selectedUsers={selectedUsers}
                                allOnPageSelected={allOnPageSelected}
                                onSelectAll={(checked) => handleSelectAll(paginatedUsers.map(u => u.id), checked)}
                                onSelectUser={handleSelectUser}
                                onView={openViewDialog}
                                onEdit={openEditDialog}
                                onRoleChange={openRoleChangeDialog}
                                onBanStatusChange={openBanDialog}
                                onDelete={openDeleteDialog}
                            />
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                perPageLabel={t("perPage")}
                                paginationLabel={getPaginationLabel(startIndex, endIndex, filteredUsers.length, "users", t)}
                            />
                        </>
                    )}
                </>
            )}
            <AdminUserModals />
        </div>
    );
};

const AdminUsers = () => {
    const { users, getAdminCount, addUser, updateUser, deleteUser, changeUserStatus, changeUserRole, isLoading } = useAdminUsers();
    const dialogState = useModalState();
    const { t } = useLanguage();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center flex-1 h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AdminUsersProvider
            users={users} addUser={addUser} updateUser={updateUser}
            deleteUser={deleteUser} changeUserStatus={changeUserStatus} changeUserRole={changeUserRole}
            getAdminCount={getAdminCount} dialogState={dialogState} t={t}
        >
            <AdminUsersContent users={users} />
        </AdminUsersProvider>
    );
};

export default AdminUsers;
