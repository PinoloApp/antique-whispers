import React from "react";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminUserRow from "./AdminUserRow";
import Table from "../AdminComponents/Table";

interface AdminUsersTableProps {
    paginatedUsers: User[];
    selectedUsers: string[];
    allOnPageSelected: boolean;
    onSelectAll: (checked: boolean) => void;
    onSelectUser: (userId: string, checked: boolean) => void;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onRoleChange: (user: User, role: UserRole) => void;
    onBanStatusChange: (user: User, status: UserStatus) => void;
    onDelete: (user: User) => void;
}

const AdminUsersTable = ({
    paginatedUsers,
    selectedUsers,
    allOnPageSelected,
    onSelectAll,
    onSelectUser,
    onView,
    onEdit,
    onRoleChange,
    onBanStatusChange,
    onDelete,
}: AdminUsersTableProps) => {
    const { language } = useLanguage();

    const TABLE_COLUMNS = [
        { key: "user", label: { en: 'User', sr: 'Korisnik' }, align: "left" },
        { key: "contact", label: { en: 'Contact', sr: 'Kontakt' }, align: "left" },
        { key: "role", label: { en: 'Role', sr: 'Uloga' }, align: "center" },
        { key: "status", label: { en: 'Status', sr: 'Status' }, align: "center" },
        { key: "activity", label: { en: 'Activity', sr: 'Aktivnost' }, align: "center" },
        { key: "joined", label: { en: 'Joined', sr: 'Pridružio se' }, align: "left" },
        { key: "actions", label: { en: 'Actions', sr: 'Akcije' }, align: "right" },
    ];

    return (
        <>
            <Table
                TABLE_COLUMNS={TABLE_COLUMNS}
                isAllSelected={allOnPageSelected}
                handleSelectAllChange={onSelectAll}
                language={language}
            >
                <tbody className="divide-y divide-border">
                    {paginatedUsers.map((user) => (
                        <AdminUserRow
                            key={user.id}
                            user={user}
                            isSelected={selectedUsers.includes(user.id)}
                            onSelectUser={onSelectUser}
                            onView={onView}
                            onEdit={onEdit}
                            onRoleChange={onRoleChange}
                            onBanStatusChange={onBanStatusChange}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
};

export default React.memo(AdminUsersTable);
