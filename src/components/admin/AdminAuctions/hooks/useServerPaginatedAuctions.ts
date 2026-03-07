import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { AuctionService } from "@/services/auctionService";
import { Auction } from "@/contexts/DataContext";

export type AuctionSortOption =
    | "newest"
    | "oldest"
    | "startDate-asc"
    | "startDate-desc"
    | "title-asc"
    | "title-desc";

interface UseServerPaginatedAuctionsProps {
    language: "en" | "sr";
    statusOptions: { value: string; labelEn: string; labelSr: string }[];
}

export const useServerPaginatedAuctions = ({ language, statusOptions }: UseServerPaginatedAuctionsProps) => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<AuctionSortOption>("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

    // All auctions from Firestore (for search/client mode and validation)
    const [allAuctions, setAllAuctions] = useState<Auction[]>([]);
    const allAuctionsUnsubRef = useRef<(() => void) | null>(null);

    // Server mode state
    const [pageAuctions, setPageAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const cursorCacheRef = useRef<Map<number, DocumentSnapshot>>(new Map());
    const unsubRef = useRef<(() => void) | null>(null);

    const isServerMode = searchQuery.trim() === "";

    // Subscribe to all auctions
    useEffect(() => {
        allAuctionsUnsubRef.current = AuctionService.subscribeAll((auctions) => {
            setAllAuctions(auctions);
        });
        return () => {
            allAuctionsUnsubRef.current?.();
            allAuctionsUnsubRef.current = null;
        };
    }, []);

    // Derive total count from allAuctions (real-time)
    const totalCount = useMemo(() => {
        if (statusFilter === "all") return allAuctions.length;
        return allAuctions.filter((a) => a.status === statusFilter).length;
    }, [allAuctions, statusFilter]);

    // Subscribe to paginated data (server mode)
    useEffect(() => {
        if (!isServerMode) return;

        setLoading(true);
        unsubRef.current?.();

        const cursor = currentPage === 1 ? null : cursorCacheRef.current.get(currentPage - 1) ?? null;

        // Fetch intermediate pages if cursor is missing
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
                        const result = await AuctionService.getPaginated(itemsPerPage, lastCursor, sortBy, statusFilter);
                        if (result.lastDoc) {
                            cursorCacheRef.current.set(p, result.lastDoc);
                            lastCursor = result.lastDoc;
                        }
                    }

                    if (cancelled) return;

                    const finalCursor = cursorCacheRef.current.get(currentPage - 1) ?? null;
                    unsubRef.current = AuctionService.subscribePaginated(
                        itemsPerPage, finalCursor, sortBy as string, statusFilter,
                        ({ auctions, lastDoc }) => {
                            setPageAuctions(auctions);
                            if (lastDoc) {
                                cursorCacheRef.current.set(currentPage, lastDoc);
                            }
                            if (auctions.length === 0 && currentPage > 1) {
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

        unsubRef.current = AuctionService.subscribePaginated(
            itemsPerPage, cursor, sortBy as string, statusFilter,
            ({ auctions, lastDoc }) => {
                setPageAuctions(auctions);
                if (lastDoc) {
                    cursorCacheRef.current.set(currentPage, lastDoc);
                }
                if (auctions.length === 0 && currentPage > 1) {
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

    // Client mode: filter/sort/paginate allAuctions
    const clientFilteredAndSorted = useMemo(() => {
        if (isServerMode) return [];
        return allAuctions
            .filter((auction) => {
                const searchLower = searchQuery.toLowerCase();
                const searchMatch =
                    searchQuery === "" ||
                    auction.title.en.toLowerCase().includes(searchLower) ||
                    auction.title.sr.toLowerCase().includes(searchLower) ||
                    auction.description.en.toLowerCase().includes(searchLower) ||
                    auction.description.sr.toLowerCase().includes(searchLower);

                const statusMatch = statusFilter === "all" || auction.status === statusFilter;

                return searchMatch && statusMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "startDate-asc":
                        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                    case "startDate-desc":
                        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                    case "title-asc":
                        return a.title[language].localeCompare(b.title[language]);
                    case "title-desc":
                        return b.title[language].localeCompare(a.title[language]);
                    case "oldest":
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    case "newest":
                    default:
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });
    }, [allAuctions, statusFilter, searchQuery, sortBy, language, isServerMode]);

    // Computed values
    const effectiveTotalCount = isServerMode ? totalCount : clientFilteredAndSorted.length;
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage) || 1;
    const startIndex = Math.min((currentPage - 1) * itemsPerPage, effectiveTotalCount);
    const endIndex = Math.min(startIndex + itemsPerPage, effectiveTotalCount);

    const paginatedAuctions = useMemo(() => {
        if (isServerMode) return pageAuctions;
        return clientFilteredAndSorted.slice(startIndex, endIndex);
    }, [isServerMode, pageAuctions, clientFilteredAndSorted, startIndex, endIndex]);

    // Handlers
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        cursorCacheRef.current.clear();
    }, []);

    const handleFilterChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        resetPagination();
        setPageAuctions([]);
    }, [resetPagination]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        resetPagination();
    }, [resetPagination]);

    const handleSortChange = useCallback((value: string) => {
        setSortBy(value as AuctionSortOption);
        resetPagination();
        setPageAuctions([]);
    }, [resetPagination]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const selectFilters = [
        {
            key: "status",
            value: statusFilter,
            onChange: (val: string) => handleFilterChange(setStatusFilter, val),
            placeholder: language === "en" ? "Status" : "Status",
            options: [
                { value: "all", label: language === "en" ? "All Statuses" : "Svi Statusi" },
                ...statusOptions.map((opt) => ({
                    value: opt.value,
                    label: language === "en" ? opt.labelEn : opt.labelSr,
                })),
            ],
        },
        {
            key: "sort",
            value: sortBy,
            onChange: handleSortChange,
            placeholder: language === "en" ? "Sort by" : "Sortiraj po",
            options: [
                { value: "newest", label: language === "en" ? "Newest First" : "Najnovije Prvo" },
                { value: "oldest", label: language === "en" ? "Oldest First" : "Najstarije Prvo" },
                { value: "startDate-desc", label: language === "en" ? "Start Date (New-Old)" : "Datum početka (Noviji-Stariji)" },
                { value: "startDate-asc", label: language === "en" ? "Start Date (Old-New)" : "Datum početka (Stariji-Noviji)" },
                { value: "title-asc", label: language === "en" ? "Title A-Z" : "Naslov A-Ž" },
                { value: "title-desc", label: language === "en" ? "Title Z-A" : "Naslov Ž-A" },
            ],
        },
    ];

    return {
        selectFilters,
        statusFilter,
        setStatusFilter: (val: string) => handleFilterChange(setStatusFilter, val),
        searchQuery,
        setSearchQuery: handleSearchChange,
        sortBy,
        setSortBy: handleSortChange,
        currentPage,
        setCurrentPage: handlePageChange,
        itemsPerPage,
        setItemsPerPage: handleItemsPerPageChange,
        ITEMS_PER_PAGE_OPTIONS,
        allAuctions,
        paginatedAuctions,
        totalPages,
        totalCount: effectiveTotalCount,
        startIndex,
        endIndex,
        resetPagination,
        loading,
    };
};
