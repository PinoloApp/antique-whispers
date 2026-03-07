import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { User, UserRole, UserStatus } from "@/types/adminUsers.types";
import { toast } from "@/hooks/use-toast";

export const useAdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData: User[] = snapshot.docs.map(doc => {
                const data = doc.data();

                let firstName = data.firstName;
                let lastName = data.lastName;

                if (!firstName && data.name) {
                    const nameParts = data.name.split(" ");
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(" ") || "";
                }

                return {
                    id: doc.id,
                    ...data,
                    firstName: firstName || "Unknown",
                    lastName: lastName || "",
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastLoginAt: data.lastLoginAt?.toDate(),
                    totalBids: data.totalBids || 0,
                    wonAuctions: data.wonAuctions || 0,
                    bidHistory: data.bidHistory || []
                } as User;
            });
            setUsers(usersData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            toast({ title: "Error", description: "Failed to load users from database.", variant: "destructive" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const functions = getFunctions();

    const addUser = useCallback(async (newUser: User) => {
        try {
            const registerUser = httpsCallable(functions, "registerUser");
            const result = await registerUser({
                email: newUser.email,
                name: `${newUser.firstName} ${newUser.lastName}`,
                password: "DefaultPassword123!", // Initial password, should force reset or send link
            });
            // If the user should be admin, set the role after creation
            if (newUser.role === "admin") {
                const uid = (result.data as any)?.uid;
                if (uid) {
                    const setUserRole = httpsCallable(functions, "setUserRole");
                    await setUserRole({ uid, role: "admin" });
                }
            }
        } catch (error: any) {
            console.error("Error creating user:", error);
            throw error;
        }
    }, [functions]);

    const updateUser = useCallback(async (updatedUser: User) => {
        try {
            const adminUpdateUser = httpsCallable(functions, "adminUpdateUser");
            await adminUpdateUser({
                uid: updatedUser.id,
                data: {
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone || null,
                }
            });
        } catch (error: any) {
            console.error("Error updating user:", error);
            throw error;
        }
    }, [functions]);

    const deleteUser = useCallback(async (userId: string) => {
        try {
            const adminDeleteUser = httpsCallable(functions, "adminDeleteUser");
            await adminDeleteUser({ uid: userId });
        } catch (error: any) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }, [functions]);

    const changeUserStatus = useCallback(async (userId: string, newStatus: UserStatus) => {
        try {
            const adminUpdateUser = httpsCallable(functions, "adminUpdateUser");
            await adminUpdateUser({ uid: userId, data: { status: newStatus } });
        } catch (error: any) {
            console.error("Error changing status:", error);
            throw error;
        }
    }, [functions]);

    const changeUserRole = useCallback(async (userId: string, newRole: UserRole) => {
        try {
            const setUserRole = httpsCallable(functions, "setUserRole");
            await setUserRole({ uid: userId, role: newRole });
        } catch (error: any) {
            console.error("Error changing role:", error);
            throw error;
        }
    }, [functions]);

    const getAdminCount = useCallback(() => {
        return users.filter((u) => u.role === "admin").length;
    }, [users]);

    return {
        users,
        setUsers,
        addUser,
        updateUser,
        deleteUser,
        changeUserStatus,
        changeUserRole,
        getAdminCount,
        isLoading
    };
};

