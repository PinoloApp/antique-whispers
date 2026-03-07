import React, { createContext, useContext } from "react";
import { useAdminUsersContextValue, UseAdminUsersContextValueProps } from "@/hooks/useAdminUsersContextValue";

export type AdminUsersContextValue = ReturnType<typeof useAdminUsersContextValue>;

const AdminUsersContext = createContext<AdminUsersContextValue | undefined>(undefined);

export const AdminUsersProvider: React.FC<UseAdminUsersContextValueProps & { children: React.ReactNode }> = ({ children, ...props }) => {
    const value = useAdminUsersContextValue(props);
    return (
        <AdminUsersContext.Provider value={value}>
            {children}
        </AdminUsersContext.Provider>
    );
};

export const useAdminUsersContext = () => {
    const ctx = useContext(AdminUsersContext);
    if (!ctx) {
        throw new Error("useAdminUsersContext must be used within AdminUsersProvider");
    }
    return ctx;
};
