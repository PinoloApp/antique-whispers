import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { CollectionService } from "@/services/collectionService";
import { Collection } from "@/contexts/DataContext";
import { SelectFilterConfig } from "../../AdminComponents/filters/types";
import { FILTER_CONFIG } from "../../config";
import { CollectionStatus } from "@/contexts/DataContext";

export type CollectionSortOption =
    | "id-desc"
    | "id-asc"
    | "name-asc"
    | "name-desc"
    | "price-asc"
    | "price-desc"
    | "newest"
    | "oldest";

export type CollectionStatusFilter = "all" | CollectionStatus;

interface UseServerPaginatedCollectionsProps {
    language: "en" | "sr";
}

const isServerCompatibleSort = (sort: CollectionSortOption) => true;

export const useServerPaginatedCollections = ({ language }: UseServerPaginatedCollectionsProps) => {
    const [statusFilter, setStatusFilter] = useState<CollectionStatusFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<CollectionSortOption>("newest" as CollectionSortOption);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

    // All collections from Firestore (for search/client mode and validation)
    const [allCollections, setAllCollections] = useState<Collection[]>([]);
    const allCollectionsUnsubRef = useRef<(() => void) | null>(null);

    // Server mode state
    const [pageCollections, setPageCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const cursorCacheRef = useRef<Map<number, DocumentSnapshot>>(new Map());
    const unsubRef = useRef<(() => void) | null>(null);

    const isServerMode = searchQuery.trim() === "" && isServerCompatibleSort(sortBy);

    // Subscribe to all collections (for client mode fallback and validation)
    useEffect(() => {
        allCollectionsUnsubRef.current = CollectionService.subscribeAll((collections) => {
            setAllCollections(collections);
        });
        return () => {
            allCollectionsUnsubRef.current?.();
            allCollectionsUnsubRef.current = null;
        };
    }, []);

    // Derive total count from allCollections (real-time via subscribeAll)
    const totalCount = useMemo(() => {
        if (statusFilter === "all") return allCollections.length;
        return allCollections.filter((c) => c.status === statusFilter).length;
    }, [allCollections, statusFilter]);

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
                        const result = await CollectionService.getPaginated(itemsPerPage, lastCursor, sortBy, statusFilter);
                        if (result.lastDoc) {
                            cursorCacheRef.current.set(p, result.lastDoc);
                            lastCursor = result.lastDoc;
                        }
                    }

                    if (cancelled) return;

                    const finalCursor = cursorCacheRef.current.get(currentPage - 1) ?? null;
                    unsubRef.current = CollectionService.subscribePaginated(
                        itemsPerPage, finalCursor, sortBy, statusFilter,
                        ({ collections, lastDoc }) => {
                            setPageCollections(collections);
                            if (lastDoc) {
                                cursorCacheRef.current.set(currentPage, lastDoc);
                            }
                            if (collections.length === 0 && currentPage > 1) {
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

        unsubRef.current = CollectionService.subscribePaginated(
            itemsPerPage, cursor, sortBy, statusFilter,
            ({ collections, lastDoc }) => {
                setPageCollections(collections);
                if (lastDoc) {
                    cursorCacheRef.current.set(currentPage, lastDoc);
                }
                if (collections.length === 0 && currentPage > 1) {
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
    }, [currentPage, itemsPerPage, sortBy, statusFilter, isServerMode]);

    // Cleanup when switching to client mode
    useEffect(() => {
        if (!isServerMode) {
            unsubRef.current?.();
            unsubRef.current = null;
            setLoading(false);
        }
    }, [isServerMode]);

    // Client mode: filter/sort/paginate allCollections
    const clientFilteredAndSorted = useMemo(() => {
        if (isServerMode) return [];
        return allCollections
            .filter((c) => {
                const q = searchQuery.toLowerCase();
                const searchMatch =
                    !q ||
                    c.name.en.toLowerCase().includes(q) ||
                    c.name.sr.toLowerCase().includes(q) ||
                    c.lotNumber.toLowerCase().includes(q);
                const statusMatch = statusFilter === "all" || c.status === statusFilter;
                return searchMatch && statusMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "name-asc":
                        return a.name.en.localeCompare(b.name.en);
                    case "name-desc":
                        return b.name.en.localeCompare(a.name.en);
                    case "price-asc":
                        return a.startingPrice - b.startingPrice;
                    case "price-desc":
                        return b.startingPrice - a.startingPrice;
                    case "id-asc":
                        return a.id - b.id;
                    case "id-desc":
                        return b.id - a.id;
                    case "newest":
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case "oldest":
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    default:
                        // Default to ID descending if newer ones have higher IDs or fallback
                        return b.id - a.id;
                }
            });
    }, [allCollections, statusFilter, searchQuery, sortBy, language, isServerMode]);

    // Computed values
    const effectiveTotalCount = isServerMode ? totalCount : clientFilteredAndSorted.length;
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage);
    const startIndex = Math.min((currentPage - 1) * itemsPerPage, effectiveTotalCount);
    const endIndex = Math.min(startIndex + itemsPerPage, effectiveTotalCount);

    const paginatedCollections = useMemo(() => {
        if (isServerMode) return pageCollections;
        return clientFilteredAndSorted.slice(startIndex, endIndex);
    }, [isServerMode, pageCollections, clientFilteredAndSorted, startIndex, endIndex]);

    const filteredAndSortedCollections = isServerMode ? pageCollections : clientFilteredAndSorted;

    // Handlers
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        cursorCacheRef.current.clear();
    }, []);

    const handleFilterChange = useCallback((newFilter: CollectionStatusFilter) => {
        setStatusFilter(newFilter);
        resetPagination();
        if (isServerMode) setPageCollections([]);
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
        setSortBy(value as CollectionSortOption);
        resetPagination();
        if (isServerMode) setPageCollections([]);
    }, [resetPagination, isServerMode]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Filter configs
    const FILTERS = {
        status: FILTER_CONFIG.collectionStatus(language),
        sort: FILTER_CONFIG.collectionSort(language),
    };

    const selectFilters: SelectFilterConfig<string>[] = [
        {
            key: "status",
            value: statusFilter as string,
            onChange: (val: string) => handleFilterChange(val as CollectionStatusFilter),
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
        filteredCollections: filteredAndSortedCollections,
        paginatedCollections,
        totalPages,
        totalCount: effectiveTotalCount,
        startIndex,
        endIndex,
        loading,
        allCollections,
        handleFilterChange,
        setFilterStatus: handleFilterChange,
        setSearchQuery: handleSearchChange,
        handleItemsPerPageChange,
        setItemsPerPage: handleItemsPerPageChange,
        resetPagination,
    };
};
