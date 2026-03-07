import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    where,
    getCountFromServer,
    DocumentSnapshot,
    onSnapshot,
    Unsubscribe
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Auction } from "../contexts/DataContext";

const COLLECTION_NAME = "auctions";

export const AuctionService = {
    /**
     * Fetch total count of auctions based on status filter
     */
    async getTotalCount(statusFilter: string = "all"): Promise<number> {
        const collRef = collection(db, COLLECTION_NAME);
        let q = query(collRef);
        if (statusFilter !== "all") {
            q = query(collRef, where("status", "==", statusFilter));
        }
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    },

    /**
     * Fetch a paginated chunk of auctions from Firestore
     */
    async getPaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null = null,
        sortBy: string = "newest",
        statusFilter: string = "all"
    ): Promise<{ auctions: Auction[], lastDoc: DocumentSnapshot | null }> {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        // 1. Status Filter
        if (statusFilter !== "all") {
            queryConstraints.push(where("status", "==", statusFilter));
        }

        // 2. Sorting
        switch (sortBy) {
            case "title-asc":
                queryConstraints.push(orderBy("title.en", "asc"));
                break;
            case "title-desc":
                queryConstraints.push(orderBy("title.en", "desc"));
                break;
            case "newest":
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
            case "oldest":
                queryConstraints.push(orderBy("createdAt", "asc"));
                break;
            case "startDate-asc":
                queryConstraints.push(orderBy("startDate", "asc"));
                break;
            case "startDate-desc":
                queryConstraints.push(orderBy("startDate", "desc"));
                break;
            default:
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
        }

        // 3. Pagination limits
        if (lastDocSnap) {
            queryConstraints.push(startAfter(lastDocSnap));
        }
        queryConstraints.push(limit(limitCount));

        const q = query(collRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);

        const auctions: Auction[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            auctions.push({
                ...data,
                id: data.id || docSnap.id,
                date: data.date?.toDate ? data.date.toDate() : new Date(data.date || Date.now()),
                startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
                endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as any);
        });

        const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

        return { auctions, lastDoc };
    },

    /**
     * Get all auctions
     */
    async getAll(): Promise<Auction[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const auctions: Auction[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            auctions.push({
                ...data,
                id: data.id || docSnap.id,
                date: data.date?.toDate ? data.date.toDate() : new Date(data.date || Date.now()),
                startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
                endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as any);
        });
        return auctions;
    },

    /**
     * Add a new auction to Firestore
     */
    async create(auction: Auction): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, auction.id.toString());
        await setDoc(docRef, {
            ...auction,
            createdAt: new Date(),
        });
    },

    /**
     * Update an existing auction in Firestore
     */
    async update(id: number | string, updates: Partial<Auction>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
    },

    /**
     * Delete an auction from Firestore
     */
    async delete(id: number | string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        await deleteDoc(docRef);
    },

    /**
     * Subscribe to real-time updates for all auctions
     */
    subscribeAll(callback: (auctions: Auction[]) => void): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        return onSnapshot(collRef, (snapshot) => {
            const auctions: Auction[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                auctions.push({
                    ...data,
                    id: data.id || docSnap.id,
                    lotIds: (data.lotIds || []).map(Number),
                    collectionIds: (data.collectionIds || []).map(Number),
                    date: data.date?.toDate ? data.date.toDate() : new Date(data.date || Date.now()),
                    startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
                    endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                } as any);
            });
            callback(auctions);
        });
    },

    /**
     * Subscribe to real-time paginated auctions
     */
    subscribePaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null,
        sortBy: string,
        statusFilter: string,
        callback: (data: { auctions: Auction[], lastDoc: DocumentSnapshot | null }) => void
    ): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        if (statusFilter !== "all") {
            queryConstraints.push(where("status", "==", statusFilter));
        }

        switch (sortBy) {
            case "title-asc":
                queryConstraints.push(orderBy("title.en", "asc"));
                break;
            case "title-desc":
                queryConstraints.push(orderBy("title.en", "desc"));
                break;
            case "newest":
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
            case "oldest":
                queryConstraints.push(orderBy("createdAt", "asc"));
                break;
            case "startDate-asc":
                queryConstraints.push(orderBy("startDate", "asc"));
                break;
            case "startDate-desc":
                queryConstraints.push(orderBy("startDate", "desc"));
                break;
            default:
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
        }

        if (lastDocSnap) {
            queryConstraints.push(startAfter(lastDocSnap));
        }
        queryConstraints.push(limit(limitCount));

        const q = query(collRef, ...queryConstraints);
        return onSnapshot(q, (snapshot) => {
            const auctions: Auction[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                auctions.push({
                    ...data,
                    id: data.id || docSnap.id,
                    lotIds: (data.lotIds || []).map(Number),
                    collectionIds: (data.collectionIds || []).map(Number),
                    date: data.date?.toDate ? data.date.toDate() : new Date(data.date || Date.now()),
                    startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
                    endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                } as any);
            });
            const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
            callback({ auctions, lastDoc });
        });
    }
};
