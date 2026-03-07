import { db } from "../firebase/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    Timestamp
} from "firebase/firestore";

export interface Notification {
    id: string;
    userId: string;
    type: "bid_placed" | "outbid" | "winning" | "auction" | "won" | "info";
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    timestamp: Date;
    read: boolean;
    productId?: number;
    amount?: number;
}

export class NotificationService {
    private static collectionName = "notifications";

    static subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
                } as Notification;
            });
            callback(notifications);
        });
    }

    static async markAsRead(notificationId: string) {
        const docRef = doc(db, this.collectionName, notificationId);
        await updateDoc(docRef, { read: true });
    }

    static async markAllAsRead(userId: string, notifications: Notification[]) {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        const batch = writeBatch(db);
        unread.forEach(n => {
            const docRef = doc(db, this.collectionName, n.id);
            batch.update(docRef, { read: true });
        });
        await batch.commit();
    }
}
