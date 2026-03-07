import { useState, useEffect } from "react";
import { Category } from "@/contexts/DataContext";
import { CategoryService } from "@/services/categoryService";

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = CategoryService.subscribeAll((fetched) => {
            setCategories(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { categories, loading };
};
