import { db } from "../firebase/firebase";
import { 
    collection, 
    query, 
    where, 
    getDocs,
    doc,
    getDoc,
    writeBatch,
    arrayRemove
} from "firebase/firestore";

export class UserService {
    private static collectionName = "users";

    /**
     * Removes a product or collection from multiple users' favorites in Firestore.
     */
    static async removeFromFavorites(productId: number, userIds: string[], isCollection: boolean = false) {
        if (userIds.length === 0) return;

        const batch = writeBatch(db);
        const fieldName = isCollection ? "collectionFavorites" : "favorites";

        userIds.forEach(userId => {
            const userDocRef = doc(db, this.collectionName, userId);
            batch.update(userDocRef, {
                [fieldName]: arrayRemove(productId)
            });
        });

        await batch.commit();
    }

    /**
     * Finds all user IDs that are interested in a product or collection.
     * Interested users are:
     * 1. Users who have favorited the item (stored in the user document)
     * 2. Users who have placed a bid on the item (found via email matching)
     */
    static async getInterestedUsers(productId: number, isCollection: boolean = false): Promise<string[]> {
        const userIds = new Set<string>();

        // 1. Find users who favorited this item
        // We query users where the favorites/collectionFavorites array contains the productId
        const fieldName = isCollection ? "collectionFavorites" : "favorites";
        const favoritesQuery = query(
            collection(db, this.collectionName),
            where(fieldName, "array-contains", productId)
        );

        const favoritesSnapshot = await getDocs(favoritesQuery);
        favoritesSnapshot.forEach(doc => userIds.add(doc.id));

        // 2. Find users who bid on this item
        // First, get all bids for this item to get bidder emails
        const bidsQuery = query(
            collection(db, "bids"),
            where("productId", "==", productId)
        );
        const bidsSnapshot = await getDocs(bidsQuery);
        const bidderEmails = new Set<string>();
        bidsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.bidderEmail && data.bidderEmail !== "live@auction.com") {
                bidderEmails.add(data.bidderEmail);
            }
        });

        // Map bidder emails back to user IDs
        if (bidderEmails.size > 0) {
            // Firestore 'in' query supports up to 10-30 values depending on SDK, but typically 10/30.
            // For now, we'll do them in chunks or individually if the count is small.
            const emails = Array.from(bidderEmails);
            const userQuery = query(
                collection(db, this.collectionName),
                where("email", "in", emails.slice(0, 30)) // Limit to 30 for safety
            );
            const userSnapshot = await getDocs(userQuery);
            userSnapshot.forEach(doc => userIds.add(doc.id));
        }

        return Array.from(userIds);
    }

    /**
     * Get a user's data by ID
     */
    static async getUserById(userId: string) {
        const docRef = doc(db, this.collectionName, userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    }
}
