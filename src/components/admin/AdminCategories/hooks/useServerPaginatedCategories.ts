import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { CategoryService } from "@/services/categoryService";
import { Category } from "@/contexts/DataContext";
import { SortOption, StatusFilter } from "../types";
import { SelectFilterConfig } from "../../AdminComponents/filters/types";
import { FILTER_CONFIG } from "../../config";

interface UseServerPaginatedCategoriesProps {
    language: "en" | "sr";
}

const isServerCompatibleSort = (sort: SortOption) =>
    sort !== "item-asc" && sort !== "item-desc";

export const useServerPaginatedCategories = ({ language }: UseServerPaginatedCategoriesProps) => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

    // All categories from Firestore (for search/client mode and validation)
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const allCategoriesUnsubRef = useRef<(() => void) | null>(null);

    // Server mode state
    const [pageCategories, setPageCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const cursorCacheRef = useRef<Map<number, DocumentSnapshot>>(new Map());
    const unsubRef = useRef<(() => void) | null>(null);

    const isServerMode = searchQuery.trim() === "" && isServerCompatibleSort(sortBy);

    // Subscribe to all categories (for client mode fallback and validation)
    useEffect(() => {
        allCategoriesUnsubRef.current = CategoryService.subscribeAll((categories) => {
            setAllCategories(categories);
        });
        return () => {
            allCategoriesUnsubRef.current?.();
            allCategoriesUnsubRef.current = null;
        };
    }, []);

    // Derive total count from allCategories (real-time via subscribeAll)
    const totalCount = useMemo(() => {
        if (statusFilter === "all") return allCategories.length;
        return allCategories.filter((c) => statusFilter === "active" ? c.isActive : !c.isActive).length;
    }, [allCategories, statusFilter]);

    // Subscribe to paginated data (server mode)
    useEffect(() => {
        if (!isServerMode) return;

        setLoading(true);
        unsubRef.current?.();

        const cursor = currentPage === 1 ? null : cursorCacheRef.current.get(currentPage - 1) ?? null;

        // If we need a cursor for this page but don't have it, fetch intermediate pages
        if (currentPage > 1 && !cursor) {
            let cancelled = false;
            (async () => {
                try {
                    let startPage = 1;
                    let lastCursor: DocumentSnapshot | null = null;

                    for (let p = currentPage - 1; p >= 1; p--) {
                        const cached = cursorCacheRef.current.get(p);
                        if (cached) {
                            lastCursor = cached;
                            startPage = p + 1;
                            break;
                        }
                    }

                    for (let p = startPage; p < currentPage; p++) {
                        if (cancelled) return;
                        const result = await CategoryService.getPaginated(itemsPerPage, lastCursor, sortBy, statusFilter);
                        if (result.lastDoc) {
                            cursorCacheRef.current.set(p, result.lastDoc);
                            lastCursor = result.lastDoc;
                        }
                    }

                    if (cancelled) return;

                    const finalCursor = cursorCacheRef.current.get(currentPage - 1) ?? null;
                    unsubRef.current = CategoryService.subscribePaginated(
                        itemsPerPage, finalCursor, sortBy, statusFilter,
                        ({ categories, lastDoc }) => {
                            setPageCategories(categories);
                            if (lastDoc) {
                                cursorCacheRef.current.set(currentPage, lastDoc);
                            }
                            if (categories.length === 0 && currentPage > 1) {
                                setCurrentPage(1);
                                cursorCacheRef.current.clear();
                                return;
                            }
                            setLoading(false);
                        }
                    );
                } catch (error) {
                    console.error("Error fetching cursors:", error);
                    setLoading(false);
                }
            })();

            return () => {
                cancelled = true;
                unsubRef.current?.();
                unsubRef.current = null;
            };
        }

        unsubRef.current = CategoryService.subscribePaginated(
            itemsPerPage, cursor, sortBy, statusFilter,
            ({ categories, lastDoc }) => {
                setPageCategories(categories);
                if (lastDoc) {
                    cursorCacheRef.current.set(currentPage, lastDoc);
                }
                if (categories.length === 0 && currentPage > 1) {
                    setCurrentPage(1);
                    cursorCacheRef.current.clear();
                    return;
                }
                setLoading(false);
            }
        );

        return () => {
            unsubRef.current?.();
            unsubRef.current = null;
        };
    }, [currentPage, itemsPerPage, sortBy, statusFilter, isServerMode, refreshTrigger]);

    // Cleanup when switching to client mode
    useEffect(() => {
        if (!isServerMode) {
            unsubRef.current?.();
            unsubRef.current = null;
            setLoading(false);
        }
    }, [isServerMode]);

    // Client mode: filter/sort/paginate allCategories
    const clientFilteredAndSorted = useMemo(() => {
        if (isServerMode) return [];
        return allCategories
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
    }, [allCategories, statusFilter, searchQuery, sortBy, language, isServerMode]);

    // Computed values
    const effectiveTotalCount = isServerMode ? totalCount : clientFilteredAndSorted.length;
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage);
    const startIndex = Math.min((currentPage - 1) * itemsPerPage, effectiveTotalCount);
    const endIndex = Math.min(startIndex + itemsPerPage, effectiveTotalCount);

    const paginatedCategories = useMemo(() => {
        if (isServerMode) return pageCategories;
        return clientFilteredAndSorted.slice(startIndex, endIndex);
    }, [isServerMode, pageCategories, clientFilteredAndSorted, startIndex, endIndex]);

    const filteredAndSortedCategories = isServerMode ? pageCategories : clientFilteredAndSorted;

    // Handlers
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        cursorCacheRef.current.clear();
    }, []);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const handleFilterChange = useCallback((newFilter: StatusFilter) => {
        setStatusFilter(newFilter);
        resetPagination();
        if (isServerMode) setPageCategories([]);
    }, [resetPagination, isServerMode]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        resetPagination();
    }, [resetPagination]);

    const handleSortChange = useCallback((value: string) => {
        setSortBy(value as SortOption);
        resetPagination();
        if (isServerMode) setPageCategories([]);
    }, [resetPagination, isServerMode]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Filter configs (same shape as useCategoryFilterSort)
    const FILTERS = {
        status: FILTER_CONFIG.status(language, {
            total: allCategories.length,
            active: allCategories.filter((c) => c.isActive).length,
            inactive: allCategories.filter((c) => !c.isActive).length,
        }),
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
            onChange: handleSortChange,
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
        setCurrentPage: handlePageChange,
        itemsPerPage,
        ITEMS_PER_PAGE_OPTIONS,
        filteredAndSortedCategories,
        paginatedCategories,
        totalPages,
        totalCount: effectiveTotalCount,
        startIndex,
        endIndex,
        loading,
        allCategories,
        handleFilterChange,
        handleSearchChange,
        handleItemsPerPageChange,
        resetPagination,
        refresh,
    };
};
