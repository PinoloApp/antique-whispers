import { useState, useMemo, useCallback } from "react";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";

export const useUserFilters = (users: User[]) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
    const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.phone && user.phone.includes(searchQuery));

            const matchesRole = filterRole === "all" || user.role === filterRole;
            const matchesStatus = filterStatus === "all" || user.status === filterStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, filterRole, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = useMemo(() => filteredUsers.slice(startIndex, endIndex), [filteredUsers, startIndex, endIndex]);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    }, []);

    const handleRoleFilterChange = useCallback((value: UserRole | "all") => {
        setFilterRole(value);
        setCurrentPage(1);
    }, []);

    const handleStatusFilterChange = useCallback((value: UserStatus | "all") => {
        setFilterStatus(value);
        setCurrentPage(1);
    }, []);

    return {
        searchQuery,
        filterRole,
        filterStatus,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        filteredUsers,
        paginatedUsers,
        totalPages,
        startIndex,
        endIndex,
        handleItemsPerPageChange,
        handleSearchChange,
        handleRoleFilterChange,
        handleStatusFilterChange,
    };
};
