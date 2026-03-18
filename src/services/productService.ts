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
    getDoc,
    onSnapshot,
    Unsubscribe,
    writeBatch,
} from "firebase/firestore";
import { Product } from "../contexts/DataContext";
import { db, storage } from "../firebase/firebase";
import { ref, listAll, deleteObject } from "firebase/storage";
import { ProductSortOption } from "@/components/admin/AdminProducts/hooks/useServerPaginatedProducts";

const COLLECTION_NAME = "products";

export const ProductService = {
    /**
     * Fetch total count of products based on filters
     */
    async getTotalCount(
        statusFilter: string = "all",
        categoryFilter: string = "all",
        auctionFilter: string = "all",
    ): Promise<number> {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        if (statusFilter !== "all" && statusFilter !== "") {
            queryConstraints.push(where("status", "==", statusFilter));
        }
        if (categoryFilter !== "all" && categoryFilter !== "") {
            queryConstraints.push(where("category", "==", categoryFilter));
        }
        if (auctionFilter !== "all" && auctionFilter !== "") {
            queryConstraints.push(where("auctionId", "==", Number(auctionFilter)));
        }

        const q = queryConstraints.length > 0 ? query(collRef, ...queryConstraints) : query(collRef);
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    },

    /**
     * Fetch a paginated chunk of products from Firestore
     */
    async getPaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null = null,
        sortBy: ProductSortOption = "id-desc",
        statusFilter: string = "all",
        categoryFilter: string = "all",
        auctionFilter: string = "all",
    ): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        // 1. Filters
        if (statusFilter !== "all" && statusFilter !== "") {
            queryConstraints.push(where("status", "==", statusFilter));
        }
        if (categoryFilter !== "all" && categoryFilter !== "") {
            queryConstraints.push(where("category", "==", categoryFilter));
        }
        if (auctionFilter !== "all" && auctionFilter !== "") {
            queryConstraints.push(where("auctionId", "==", Number(auctionFilter)));
        }

        // 2. Sorting
        switch (sortBy) {
            case "name-asc":
                queryConstraints.push(orderBy("namesr", "asc"));
                break;
            case "name-desc":
                queryConstraints.push(orderBy("namesr", "desc"));
                break;
            case "price-asc":
                queryConstraints.push(orderBy("currentBid", "asc"));
                break;
            case "price-desc":
                queryConstraints.push(orderBy("currentBid", "desc"));
                break;
            case "id-asc":
                queryConstraints.push(orderBy("id", "asc"));
                break;
            case "id-desc":
            default:
                queryConstraints.push(orderBy("id", "desc"));
                break;
        }

        // 3. Pagination limits
        if (lastDocSnap) {
            queryConstraints.push(startAfter(lastDocSnap));
        }
        queryConstraints.push(limit(limitCount));

        const q = query(collRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);

        const products: Product[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            products.push({
                ...data,
                id: Number(docSnap.id) || docSnap.id,
            } as any);
        });

        const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;

        return { products, lastDoc };
    },

    /**
     * Get all products
     */
    async getAll(): Promise<Product[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const products: Product[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            products.push({
                ...data,
                id: Number(docSnap.id) || docSnap.id,
            } as any);
        });
        return products;
    },

    /**
     * Get a product by ID
     */
    async getById(id: number | string): Promise<Product | null> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                id: Number(docSnap.id) || docSnap.id,
            } as any;
        }
        return null;
    },

    /**
     * Add a new product to Firestore
     */
    async create(productObj: Product): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, productObj.id.toString());
        await setDoc(docRef, productObj);
    },

    /**
     * Update an existing product in Firestore
     */
    async update(id: number | string, updates: Partial<Product>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
    },

    /**
     * Delete a product from Firestore
     */
    async delete(id: number | string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        await deleteDoc(docRef);
    },

    /**
     * Delete a product and its associated Storage images
     */
    async deleteWithStorage(id: number | string, images: string[] = []): Promise<void> {
        // Attempt deleting images that are in storage folder 'products/{id}'
        try {
            const folderRef = ref(storage, `products/${id}`);
            const files = await listAll(folderRef);
            await Promise.all(files.items.map((item) => deleteObject(item)));
        } catch (e) {
            console.warn(`No storage folder for product ${id}`, e);
        }
        await this.delete(id);
    },

    /**
     * Subscribe to real-time paginated products
     */
    subscribePaginated(
        limitCount: number,
        lastDocSnap: DocumentSnapshot | null,
        sortBy: ProductSortOption,
        statusFilter: string,
        categoryFilter: string,
        auctionFilter: string,
        callback: (data: { products: Product[]; lastDoc: DocumentSnapshot | null }) => void,
    ): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        const queryConstraints: any[] = [];

        // Filters
        if (statusFilter !== "all" && statusFilter !== "") {
            queryConstraints.push(where("status", "==", statusFilter));
        }
        if (categoryFilter !== "all" && categoryFilter !== "") {
            queryConstraints.push(where("category", "==", categoryFilter));
        }
        if (auctionFilter !== "all" && auctionFilter !== "") {
            queryConstraints.push(where("auctionId", "==", Number(auctionFilter)));
        }

        // Sorting
        switch (sortBy) {
            case "name-asc":
                queryConstraints.push(orderBy("namesr", "asc"));
                break;
            case "name-desc":
                queryConstraints.push(orderBy("namesr", "desc"));
                break;
            case "price-asc":
                queryConstraints.push(orderBy("currentBid", "asc"));
                break;
            case "price-desc":
                queryConstraints.push(orderBy("currentBid", "desc"));
                break;
            case "id-asc":
                queryConstraints.push(orderBy("id", "asc"));
                break;
            case "id-desc":
            default:
                queryConstraints.push(orderBy("id", "desc"));
                break;
        }

        if (lastDocSnap) {
            queryConstraints.push(startAfter(lastDocSnap));
        }
        queryConstraints.push(limit(limitCount));

        const q = queryConstraints.length > 0 ? query(collRef, ...queryConstraints) : query(collRef, limit(limitCount));

        return onSnapshot(q, (snapshot) => {
            const products: Product[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                products.push({
                    ...data,
                    id: Number(docSnap.id) || docSnap.id,
                } as any);
            });
            const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
            callback({ products, lastDoc });
        });
    },

    /**
     * Subscribe to real-time updates for all products
     */
    subscribeAll(callback: (products: Product[]) => void): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        return onSnapshot(collRef, (snapshot) => {
            const products: Product[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                products.push({
                    ...data,
                    id: Number(docSnap.id) || docSnap.id,
                } as any);
            });
            callback(products);
        });
    },
    /**
     * Update category ID for all products in a subcategory that belong to a specific category
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
     * Clear category and subcategory for all products in a specific category
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
     * Clear category and subcategory for all products in a specific subcategory of a category
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
