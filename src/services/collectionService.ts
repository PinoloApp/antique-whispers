import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, orderBy, limit, startAfter, where, getCountFromServer, DocumentSnapshot, onSnapshot, Unsubscribe, getDoc, writeBatch } from "firebase/firestore";
import { CollectionSortOption, CollectionStatusFilter } from "../components/admin/AdminCollections/hooks/useServerPaginatedCollections";
import { db } from "../firebase/firebase";
import { storage } from "../firebase/firebase";
import { ref, listAll, deleteObject } from "firebase/storage";
import { Collection } from "../contexts/DataContext";

const COLLECTION_NAME = "collections";

export const CollectionService = {
    /**
     * Fetch total count of collections based on status filter
     */
    async getTotalCount(statusFilter: CollectionStatusFilter = "all"): Promise<number> {
        const collRef = collection(db, COLLECTION_NAME);
        let q = query(collRef);
        if (statusFilter !== "all") {
            q = query(collRef, where("status", "==", statusFilter));
        }
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    },

    /**
     * Fetch a paginated chunk of collections from Firestore
     */
    async getPaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null = null,
        sortBy: CollectionSortOption = "newest",
        statusFilter: CollectionStatusFilter = "all"
    ): Promise<{ collections: Collection[], lastDoc: DocumentSnapshot | null }> {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        // 1. Status Filter
        if (statusFilter !== "all") {
            queryConstraints.push(where("status", "==", statusFilter));
        }

        // 2. Sorting
        switch (sortBy) {
            case "name-asc":
                queryConstraints.push(orderBy("name.en", "asc"));
                break;
            case "name-desc":
                queryConstraints.push(orderBy("name.en", "desc"));
                break;
            case "price-desc":
                queryConstraints.push(orderBy("startingPrice", "desc"));
                break;
            case "price-asc":
                queryConstraints.push(orderBy("startingPrice", "asc"));
                break;
            case "newest":
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
            case "oldest":
                queryConstraints.push(orderBy("createdAt", "asc"));
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

        const collections: Collection[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            collections.push({
                ...data,
                id: Number(docSnap.id) || docSnap.id,
                productIds: (data.productIds || []).map(Number),
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as any);
        });

        const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

        return { collections, lastDoc };
    },

    /**
     * Get all collections
     */
    async getAll(): Promise<Collection[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const collections: Collection[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            collections.push({
                ...data,
                id: Number(docSnap.id) || docSnap.id,
                productIds: (data.productIds || []).map(Number),
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as any);
        });
        return collections;
    },

    /**
     * Add a new collection to Firestore
     */
    async create(customId: number, collectionObj: Omit<Collection, "id">): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, customId.toString());
        await setDoc(docRef, { ...collectionObj, id: customId });
    },

    /**
     * Update an existing collection in Firestore
     */
    async update(id: number | string, updates: Partial<Collection>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
    },

    /**
     * Delete a collection from Firestore
     */
    async delete(id: number | string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        await deleteDoc(docRef);
    },

    /**
     * Delete a collection and all its associated Storage images
     */
    async deleteWithStorage(id: number | string, productIds: number[] = []): Promise<void> {
        // 1. Delete collection images from Storage
        try {
            const collectionFolderRef = ref(storage, `collections/${id}`);
            const collectionFiles = await listAll(collectionFolderRef);
            await Promise.all(collectionFiles.items.map((item) => deleteObject(item)));
        } catch (e) {
            // Folder may not exist, that's fine
            console.warn(`No storage folder for collection ${id}`, e);
        }

        // 2. Delete product images from Storage
        for (const productId of productIds) {
            try {
                const productFolderRef = ref(storage, `collectionProducts/${productId}`);
                const productFiles = await listAll(productFolderRef);
                await Promise.all(productFiles.items.map((item) => deleteObject(item)));
            } catch (e) {
                console.warn(`No storage folder for product ${productId}`, e);
            }
        }

        // 3. Delete the Firestore document
        await this.delete(id);
    },

    /**
     * Batch update multiple collections
     * For bulk actions like change status
     */
    async updateMultiple(ids: (number | string)[], updates: Partial<Collection>): Promise<void> {
        const promises = ids.map((id) => this.update(id, updates));
        await Promise.all(promises);
    },

    /**
     * Subscribe to real-time paginated collections
     */
    subscribePaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null,
        sortBy: CollectionSortOption,
        statusFilter: CollectionStatusFilter,
        callback: (data: { collections: Collection[], lastDoc: DocumentSnapshot | null }) => void
    ): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        if (statusFilter !== "all") {
            queryConstraints.push(where("status", "==", statusFilter));
        }

        switch (sortBy) {
            case "name-asc":
                queryConstraints.push(orderBy("name.en", "asc"));
                break;
            case "name-desc":
                queryConstraints.push(orderBy("name.en", "desc"));
                break;
            case "price-desc":
                queryConstraints.push(orderBy("startingPrice", "desc"));
                break;
            case "price-asc":
                queryConstraints.push(orderBy("startingPrice", "asc"));
                break;
            case "newest":
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
            case "oldest":
                queryConstraints.push(orderBy("createdAt", "asc"));
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
            const collections: Collection[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                collections.push({
                    ...data,
                    id: Number(docSnap.id) || docSnap.id,
                    productIds: (data.productIds || []).map(Number),
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                } as any);
            });
            const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
            callback({ collections, lastDoc });
        });
    },

    /**
     * Subscribe to real-time updates for all collections
     */
    subscribeAll(callback: (collections: Collection[]) => void): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        return onSnapshot(collRef, (snapshot) => {
            const collections: Collection[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                collections.push({
                    ...data,
                    id: Number(docSnap.id) || docSnap.id,
                    productIds: (data.productIds || []).map(Number),
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                } as any);
            });
            callback(collections);
        });
    },
    /**
     * Update category ID for all collections in a subcategory that belong to a specific category
     */
    async updateCategoryForSubcategory(subcategoryId: string, oldCategoryId: string, newCategoryId: string): Promise<void> {
        const collRef = collection(db, COLLECTION_NAME);
        const q = query(
            collRef,
            where("category", "==", oldCategoryId),
            where("subcategory", "==", subcategoryId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return;

        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { category: newCategoryId });
        });

        await batch.commit();
    },

    /**
     * Clear category and subcategory for all collections in a specific category
     */
    async clearCategoryAssociations(categoryId: string): Promise<void> {
        const collRef = collection(db, COLLECTION_NAME);
        const q = query(collRef, where("category", "==", categoryId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return;

        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { category: "", subcategory: "" });
        });

        await batch.commit();
    },

    /**
     * Clear category and subcategory for all collections in a specific subcategory of a category
     */
    async clearSubcategoryAssociations(categoryId: string, subcategoryId: string): Promise<void> {
        const collRef = collection(db, COLLECTION_NAME);
        const q = query(
            collRef,
            where("category", "==", categoryId),
            where("subcategory", "==", subcategoryId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return;

        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { category: "", subcategory: "" });
        });

        await batch.commit();
    },
};
