import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebase";

export interface AdminAuthState {
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
}

export const useAdminAuth = (): AdminAuthState => {
    const [state, setState] = useState<AdminAuthState>({
        isAdmin: false,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkAdminStatus = async (user: any) => {
            if (!user) {
                setState({ isAdmin: false, isLoading: false, error: null });
                return;
            }

            try {
                // 2. Na svaku promjenu user-a: getIdTokenResult(forceRefresh: true)
                // Čita claim direktno sa Firebase servera, a ne iz lokalnog cache-a
                const idTokenResult = await user.getIdTokenResult(true);

                // 3. Provjeri claims.role === "admin"
                const isAdmin = idTokenResult.claims.role === "admin";

                setState({ isAdmin, isLoading: false, error: null });
            } catch (error: any) {
                console.error("Error verifying admin status:", error);
                setState({ isAdmin: false, isLoading: false, error: error.message });
            }
        };

        // 1. onAuthStateChanged listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            checkAdminStatus(user);

            // Cleanup prethodnog intervala
            if (intervalId) clearInterval(intervalId);

            // 5 minutni interval - Edge case 2: Browser tab ostaje otvoren nakon gubitka privilegija
            if (user) {
                intervalId = setInterval(() => {
                    checkAdminStatus(user);
                }, 5 * 60 * 1000); // 5 minuta
            }
        });

        // 5. Cleanup na unmount
        return () => {
            unsubscribe();
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return state;
};
