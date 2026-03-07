import React, { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            // Cleanup existing Firestore listener if any
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (user) {
                setCurrentUser({ ...user });
                setUserLoggedIn(true);

                // Fetch additional user data from Firestore in real-time
                const userDocRef = doc(db, "users", user.uid);
                unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setCurrentUser(prev => ({
                            ...(prev || {}),
                            ...userData,
                            uid: user.uid,
                            email: userData.email || user.email,
                            displayName: userData.displayName || user.displayName,
                            photoURL: userData.photoURL || user.photoURL,
                        }));
                    }
                }, (error) => {
                    console.error("Error listening to user doc:", error);
                });
            } else {
                setCurrentUser(null);
                setUserLoggedIn(false);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const value = {
        currentUser,
        userLoggedIn,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}