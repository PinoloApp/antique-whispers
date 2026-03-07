import { auth, functions } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, linkWithCredential } from "firebase/auth";

type AuthProps = {
    email: string,
    password: string,
    name?: string,
}

export const createCustomer = async ({ email, password, name }: AuthProps) => {
    // 1. Call Cloud Function to register user and save to Firestore
    const registerUser = httpsCallable(functions, 'registerUser');
    const result = await registerUser({ email, password, name });

    // 2. Auto login the user after successful registration since the function only creates them in backend
    if ((result.data as any).success) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    throw new Error("Registration failed");
};

export const signWithEmailAndPassword = async ({ email, password }: AuthProps) => {
    return signInWithEmailAndPassword(auth, email, password)
};

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Call Cloud Function to sync Google User Data to Firestore securely
        try {
            const syncGoogleUser = httpsCallable(functions, 'syncGoogleUser');
            await syncGoogleUser({ displayName: user.displayName });
        } catch (e) {
            console.error("Failed to sync Google user to Firestore:", e);
        }

        return result;
    } catch (error: any) {
        // Rethrow the error so AuthDialog can handle account linking if needed
        throw error;
    }
};

/**
 * Link an existing Email/Password account with a Google account.
 * This happens when a user tries to sign in with Google but already has an email account.
 */
export const linkGoogleCredential = async (email: string, password: string, pendingCredential: any) => {
    // 1. Sign in with the existing email/password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // 2. Link the pending Google credential to the now signed-in user
    await linkWithCredential(userCredential.user, pendingCredential);

    // 3. Sync to Firestore (Role/Claims etc.)
    const user = userCredential.user;
    try {
        const syncGoogleUser = httpsCallable(functions, 'syncGoogleUser');
        await syncGoogleUser({ displayName: user.displayName });
    } catch (e) {
        console.error("Failed to sync linked Google user to Firestore:", e);
    }

    return userCredential;
};

export const signOut = () => {
    return auth.signOut();
};