import { db, functions } from "../firebase/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    Timestamp
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Bid } from "../contexts/DataContext";

export class BidService {
    private static collectionName = "bids";

    /**
     * Places a bid using the Cloud Function to handle proxy bidding logic.
     */
    static async placeBid(data: {
        productId: number;
        auctionId: number;
        maxAmount: number;
        bidderName: string;
        bidderEmail?: string;
        isLiveAuction?: boolean;
    }): Promise<{ success: boolean; winning: boolean; currentPrice: number }> {
        const placeBidFn = httpsCallable<{
            productId: number;
            auctionId: number;
            maxAmount: number;
            bidderName: string;
            bidderEmail?: string;
            isLiveAuction?: boolean;
        }, {
            success: boolean;
            winning: boolean;
            currentPrice: number;
        }>(functions, "placeBid");

        try {
            const result = await placeBidFn(data);
            return result.data;
        } catch (error) {
            console.error("Error calling placeBid function:", error);
            throw error;
        }
    }

    /**
     * Fetches bids for a specific product and auction using Cloud Function.
     */
    static async getProductBids(productId: number, auctionId: number): Promise<Bid[]> {
        const getBidsFn = httpsCallable<{ productId: number; auctionId: number }, { bids: Bid[] }>(functions, "getProductBids");
        try {
            const result = await getBidsFn({ productId, auctionId });
            return result.data.bids.map(b => ({
                ...b,
                timestamp: b.timestamp ? new Date(b.timestamp) : new Date()
            }));
        } catch (error) {
            console.error("Error fetching product bids:", error);
            return [];
        }
    }

    /**
     * Subscribes to all bids (Strictly for admins who have direct Firestore access).
     */
    static subscribeToAllBidsAdmin(callback: (bids: Bid[]) => void) {
        const q = query(
            collection(db, this.collectionName),
            orderBy("timestamp", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const bids = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
                } as Bid;
            });
            callback(bids);
        });
    }
}
