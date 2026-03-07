import { useState, useEffect } from "react";
import { ProductService } from "@/services/productService";
import { Product } from "@/contexts/DataContext";

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Subscribe to all products via the service
        const unsubscribe = ProductService.subscribeAll(
            (data) => {
                setProducts(data);
                setLoading(false);
                setError(null);
            }
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return { products, loading, error };
}
