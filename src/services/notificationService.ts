import { db } from "../firebase/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    setDoc,
    writeBatch,
    limit,
    startAfter,
    getDocs,
    QueryDocumentSnapshot,
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

    static async getNotificationsPaginated(userId: string, pageSize: number, lastVisibleDoc: QueryDocumentSnapshot | null) {
        let q = query(
            collection(db, this.collectionName),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(pageSize)
        );

        if (lastVisibleDoc) {
            q = query(q, startAfter(lastVisibleDoc));
        }

        const snapshot = await getDocs(q);
        const notifications = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
            } as Notification;
        });

        return {
            notifications,
            lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
            hasMore: snapshot.docs.length === pageSize
        };
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

    static async addNotification(notification: Omit<Notification, "id">) {
        const collRef = collection(db, this.collectionName);
        const docRef = doc(collRef);
        await setDoc(docRef, {
            ...notification,
            timestamp: Timestamp.fromDate(notification.timestamp)
        });
    }

    static async sendAuctionAnnouncement(auction: any, userIds: string[]) {
        if (userIds.length === 0) return;

        const dateOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const startDateStr = new Date(auction.startDate).toLocaleString('sr-RS', dateOptions);
        const endDateStr = new Date(auction.endDate).toLocaleString('sr-RS', dateOptions);

        const title = `Nova aukcija: ${auction.title.sr}`;
        const titleEn = `New Auction: ${auction.title.en}`;
        const descriptionArr = [
            `Nova aukcija je objavljena!`,
            `Početak: ${startDateStr}`,
            `Kraj: ${endDateStr}`,
            `Više detalja kao i pregled lotova možete pogledati na kalendaru aukcija.`
        ];
        const descriptionEnArr = [
            `A new auction has been announced!`,
            `Starts: ${startDateStr}`,
            `Ends: ${endDateStr}`,
            `You can view more details as well as the list of lots on the auction calendar.`
        ];

        const description = descriptionArr.join('\n');
        const descriptionEn = descriptionEnArr.join('\n');

        // Firestore batches are limited to 500 operations.
        const BATCH_SIZE = 500;
        for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = userIds.slice(i, i + BATCH_SIZE);

            chunk.forEach(userId => {
                const docRef = doc(collection(db, this.collectionName));
                batch.set(docRef, {
                    userId,
                    type: "auction",
                    title,
                    titleEn,
                    description,
                    descriptionEn,
                    timestamp: Timestamp.now(),
                    read: false
                });
            });

            await batch.commit();
        }
    }
}
