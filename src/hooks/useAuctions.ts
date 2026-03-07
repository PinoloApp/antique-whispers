import { useState, useEffect } from "react";
import { AuctionService } from "@/services/auctionService";
import { Auction } from "@/contexts/DataContext";

export function useAuctions() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = AuctionService.subscribeAll(
            (data) => {
                setAuctions(data);
                setLoading(false);
                setError(null);
            }
        );

        return () => unsubscribe();
    }, []);

    const updateAuction = async (id: number | string, updates: Partial<Auction>) => {
        await AuctionService.update(id, updates);
    };

    return { auctions, loading, error, updateAuction };
}
