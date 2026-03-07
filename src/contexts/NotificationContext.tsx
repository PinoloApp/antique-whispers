import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./authContexts";
import { Notification, NotificationService } from "@/services/notificationService";

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentUser, userLoggedIn } = useAuth();

    useEffect(() => {
        if (!userLoggedIn || !currentUser) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsub = NotificationService.subscribeToUserNotifications(currentUser.uid, (newNotifications) => {
            setNotifications(newNotifications);
            setLoading(false);
        });

        return () => unsub();
    }, [userLoggedIn, currentUser]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = async (id: string) => {
        await NotificationService.markAsRead(id);
    };

    const markAllAsRead = async () => {
        if (currentUser) {
            await NotificationService.markAllAsRead(currentUser.uid, notifications);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                loading,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
