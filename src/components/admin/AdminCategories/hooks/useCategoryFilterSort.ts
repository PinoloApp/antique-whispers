import { useState, useEffect, useCallback, useMemo } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { CategoryService } from "@/services/categoryService";
import { Category } from "@/contexts/DataContext";
import { SortOption, StatusFilter } from "../types";
import { SelectFilterConfig } from "../../AdminComponents/filters/types";
import { FILTER_CONFIG } from "../../config";

interface UseCategoryFilterSortProps {
    categories: Category[];
    language: "en" | "sr";
}

export const useCategoryFilterSort = ({ categories, language }: UseCategoryFilterSortProps) => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

    const filteredAndSortedCategories = useMemo(() => {
        return categories
            .filter((category) => {
                const matchesStatus =
                    statusFilter === "all" ? true : statusFilter === "active" ? category.isActive : !category.isActive;
                const q = searchQuery.toLowerCase();
                const matchesCategorySearch =
                    searchQuery.trim() === ""
                        ? true
                        : category.title.en.toLowerCase().includes(q) ||
                        category.title.sr.toLowerCase().includes(q) ||
                        category.description.en.toLowerCase().includes(q) ||
                        category.description.sr.toLowerCase().includes(q) ||
                        category.id.toLowerCase().includes(q);
                const matchesSubcategorySearch =
                    searchQuery.trim() === ""
                        ? false
                        : category.subcategories.some(
                            (sub) =>
                                sub.title.en.toLowerCase().includes(q) ||
                                sub.title.sr.toLowerCase().includes(q) ||
                                sub.description.en.toLowerCase().includes(q) ||
                                sub.description.sr.toLowerCase().includes(q) ||
                                sub.id.toLowerCase().includes(q),
                        );
                return matchesStatus && (matchesCategorySearch || matchesSubcategorySearch);
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "name-asc":
                        return a.title[language].localeCompare(b.title[language]);
                    case "name-desc":
                        return b.title[language].localeCompare(a.title[language]);
                    case "item-desc":
                        return b.subcategories.length - a.subcategories.length;
                    case "item-asc":
                        return a.subcategories.length - b.subcategories.length;
                    case "newest":
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case "oldest":
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    default:
                        return 0;
                }
            });
    }, [categories, statusFilter, searchQuery, sortBy, language]);

    const totalCount = filteredAndSortedCategories.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = Math.min((currentPage - 1) * itemsPerPage, totalCount);
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    const paginatedCategories = useMemo(() => {
        return filteredAndSortedCategories.slice(startIndex, endIndex);
    }, [filteredAndSortedCategories, startIndex, endIndex]);

    const handleFilterChange = (newFilter: StatusFilter) => {
        setStatusFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    }, []);

    const FILTERS = {
        status: FILTER_CONFIG.status(language, { total: categories.length, active: categories.filter((c) => c.isActive).length, inactive: categories.filter((c) => !c.isActive).length }),
        sort: FILTER_CONFIG.sort(language),
    };

    const selectFilters: SelectFilterConfig<string>[] = [
        {
            key: "status",
            value: statusFilter as string,
            onChange: (val: string) => handleFilterChange(val as StatusFilter),
            placeholder: language === "en" ? "Filter by status" : "Filtriraj po statusu",
            options: FILTERS.status,
        },
        {
            key: "sort",
            value: sortBy as string,
            onChange: (val: string) => setSortBy(val as SortOption),
            placeholder: language === "en" ? "Sort by" : "Sortiraj po",
            options: FILTERS.sort,
        },
    ];

    return {
        selectFilters,
        statusFilter,
        searchQuery,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        ITEMS_PER_PAGE_OPTIONS,
        filteredAndSortedCategories,
        paginatedCategories,
        totalPages,
        startIndex,
        endIndex,
        handleFilterChange,
        handleSearchChange,
        handleItemsPerPageChange,
    };
};
