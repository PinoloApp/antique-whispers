import { useState, useEffect } from "react";
import { CollectionService } from "@/services/collectionService";
import { Collection } from "@/contexts/DataContext";

export function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Subscribe to all collections via the service
        const unsubscribe = CollectionService.subscribeAll(
            (data) => {
                setCollections(data);
                setLoading(false);
                setError(null);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { collections, loading, error };
}
