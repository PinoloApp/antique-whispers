import { db } from "../firebase/firebase";
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    Timestamp,
    serverTimestamp
} from "firebase/firestore";
import { Payment } from "../contexts/DataContext";

export class PaymentService {
    private static collectionName = "payments";

    static async create(payment: Omit<Payment, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, this.collectionName), {
            ...payment,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    }

    static async update(id: string, updates: Partial<Payment>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, updates);
    }

    static async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    static subscribeToAll(callback: (payments: Payment[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            orderBy("wonDate", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const payments = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                } as Payment;
            });
            callback(payments);
        });
    }
}
