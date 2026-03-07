import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, onSnapshot, Unsubscribe, writeBatch, query, where } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/firebase";
import { Product } from "../contexts/DataContext";

const COLLECTION_NAME = "collectionProducts";

export const CollectionProductService = {
    /**
     * Add a new collection product to Firestore
     */
    async create(customId: number, product: Omit<Product, "id">): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, customId.toString());
        await setDoc(docRef, { ...product, id: customId });
    },

    /**
     * Update an existing collection product in Firestore
     */
    async update(id: number | string, updates: Partial<Product>): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
    },

    /**
     * Delete a collection product from Firestore
     */
    async delete(id: number | string): Promise<void> {
        const docRef = doc(db, COLLECTION_NAME, id.toString());
        await deleteDoc(docRef);
    },

    /**
     * Get all collection products
     */
    async getAll(): Promise<Product[]> {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const collectionProducts: Product[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            collectionProducts.push({
                ...data,
                id: Number(docSnap.id) || docSnap.id,
            } as any);
        });
        return collectionProducts;
    },

    /**
     * Subscribe to real-time updates for all collection products
     */
    subscribeAll(callback: (collectionProducts: Product[]) => void): Unsubscribe {
        const collRef = collection(db, COLLECTION_NAME);
        return onSnapshot(collRef, (snapshot) => {
            const collectionProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                collectionProducts.push({
                    ...data,
                    id: Number(docSnap.id) || docSnap.id,
                } as any);
            });
            callback(collectionProducts);
        });
    },

    /**
     * Delete a collection product and its associated Storage images
     */
    async deleteWithStorage(id: number | string): Promise<void> {
        try {
            const folderRef = ref(storage, `collectionProducts/${id}`);
            const files = await listAll(folderRef);
            await Promise.all(files.items.map((item) => deleteObject(item)));
        } catch (e) {
            console.warn(`No storage folder for collection product ${id}`, e);
        }
        await this.delete(id);
    },

    /**
     * Update category ID for all collection products in a subcategory that belong to a specific category
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
     * Clear category and subcategory for all collection products in a specific category
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
     * Clear category and subcategory for all collection products in a specific subcategory of a category
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

