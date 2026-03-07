import { useState, useEffect } from "react";
import { CollectionProductService } from "@/services/collectionProductService";
import { Product } from "@/contexts/DataContext";

export function useCollectionProducts() {
    const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = CollectionProductService.subscribeAll((data) => {
            setCollectionProducts(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { collectionProducts, loading };
}
