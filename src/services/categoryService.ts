import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, getDoc, query, orderBy, limit, startAfter, where, getCountFromServer, DocumentSnapshot, onSnapshot, Unsubscribe, writeBatch } from "firebase/firestore";
import { SortOption, StatusFilter } from "../components/admin/AdminCategories/types";
import { db } from "../firebase/firebase";
import { Category, Subcategory } from "../contexts/DataContext";
import { ProductService } from "./productService";
import { CollectionService } from "./collectionService";
import { CollectionProductService } from "./collectionProductService";

const COLLECTION_NAME = "categories";

export const CategoryService = {
    /**
     * Fetch all categories from Firestore
     */
    /**
     * Fetch total count of categories based on status filter
     */
    async getTotalCount(statusFilter: StatusFilter = "all"): Promise<number> {
        const collRef = collection(db, COLLECTION_NAME);
        let q = query(collRef);
        if (statusFilter !== "all") {
            q = query(collRef, where("isActive", "==", statusFilter === "active"));
        }
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    },

    /**
     * Fetch a paginated chunk of categories from Firestore
     */
    async getPaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null = null,
        sortBy: SortOption = "newest",
        statusFilter: StatusFilter = "all"
    ): Promise<{ categories: Category[], lastDoc: DocumentSnapshot | null }> {
        const collRef = collection(db, COLLECTION_NAME);
        let queryConstraints: any[] = [];

        // 1. Status Filter
        if (statusFilter !== "all") {
            queryConstraints.push(where("isActive", "==", statusFilter === "active"));
        }

        // 2. Sorting
        switch (sortBy) {
            case "name-asc":
                queryConstraints.push(orderBy("title.en", "asc"));
                break;
            case "name-desc":
                queryConstraints.push(orderBy("title.en", "desc"));
                break;
            case "newest":
                queryConstraints.push(orderBy("createdAt", "desc"));
                break;
            case "oldest":
                queryConstraints.push(orderBy("createdAt", "asc"));
                break;
            // Note: sort by "item-asc" or "item-desc" is impossible in native Firestore unless we store a "subcategoryCount" field
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

        const categories: Category[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            categories.push({
                ...data,
                id: docSnap.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as Category);
        });

        const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

        return { categories, lastDoc };
    },

    async getAll(): Promise<Category[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const categories: Category[] = [];
        querySnapshot.forEach((docSnap) => {
            // Data in Firestore might not have exactly the same Date objects, so we need to parse them
            const data = docSnap.data();
            categories.push({
                ...data,
                id: docSnap.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            } as Category);
        });
        return categories;
    },

    /**
     * Add a new category to Firestore
     */
    async create(category: Category): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, category.id);
        await setDoc(docRef, category);
    },

    /**
     * Update an existing category in Firestore
     */
    async update(id: string, updates: Partial<Category>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id);
        // Firestore updateDoc requires a non-empty object
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
    },

    /**
     * Delete a category from Firestore and clear associations
     */
    async delete(id: string): Promise<void> {
        // 1. Clear all item associations for this category
        await Promise.all([
            ProductService.clearCategoryAssociations(id),
            CollectionService.clearCategoryAssociations(id),
            CollectionProductService.clearCategoryAssociations(id),
        ]);

        // 2. Delete the category document
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    },

    /**
     * Batch update multiple categories
     * For bulk actions like activate/deactivate
     */
    async updateMultiple(ids: string[], updates: Partial<Category>): Promise<void> {
        // In a real production app with many documents, we'd use a Firestore WriteBatch here.
        // For admin categories, a Promise.all is sufficient and simpler since the array size is small.
        const promises = ids.map((id) => this.update(id, updates));
        await Promise.all(promises);
    },

    /**
     * Subscribe to real-time paginated categories
     */
    subscribePaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null,
        sortBy: SortOption,
        statusFilter: StatusFilter,
        callback: (data: { categories: Category[], lastDoc: DocumentSnapshot | null }) => void
    ): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        if (statusFilter !== "all") {
            queryConstraints.push(where("isActive", "==", statusFilter === "active"));
        }

        switch (sortBy) {
            case "name-asc":
                queryConstraints.push(orderBy("title.en", "asc"));
                break;
            case "name-desc":
                queryConstraints.push(orderBy("title.en", "desc"));
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
            const categories: Category[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                categories.push({
                    ...data,
                    id: docSnap.id,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                } as Category);
            });
            const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
            callback({ categories, lastDoc });
        });
    },

    subscribeAll(callback: (categories: Category[]) => void): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        return onSnapshot(collRef, (snapshot) => {
            const categories: Category[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                categories.push({
                    ...data,
                    id: docSnap.id,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                } as Category);
            });
            callback(categories);
        });
    },

    /**
     * Atomically move a subcategory from one category to another and update all associated items
     */
    async moveSubcategory(sub: Subcategory, fromId: string, toId: string): Promise<void> {
        const fromDocRef = doc(db, COLLECTION_NAME, fromId);
        const toDocRef = doc(db, COLLECTION_NAME, toId);

        const [fromSnap, toSnap] = await Promise.all([getDoc(fromDocRef), getDoc(toDocRef)]);

        if (!fromSnap.exists() || !toSnap.exists()) {
            throw new Error("Source or target category not found");
        }

        const fromData = fromSnap.data() as Category;
        const toData = toSnap.data() as Category;

        const batch = writeBatch(db);

        // 1. Remove from source category
        batch.update(fromDocRef, {
            subcategories: (fromData.subcategories || []).filter((s) => s.id !== sub.id),
        });

        // 2. Add to target category
        batch.update(toDocRef, {
            subcategories: [...(toData.subcategories || []), { ...sub, parentCategoryId: toId }],
        });

        // 3. Commit category changes
        await batch.commit();

        // 4. Update all associated items (Lots, Collections, Collection Products)
        // Note: These use their own batches internally
        await Promise.all([
            ProductService.updateCategoryForSubcategory(sub.id, fromId, toId),
            CollectionService.updateCategoryForSubcategory(sub.id, fromId, toId),
            CollectionProductService.updateCategoryForSubcategory(sub.id, fromId, toId),
        ]);
    },
};
