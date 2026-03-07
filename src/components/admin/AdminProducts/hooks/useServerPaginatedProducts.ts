import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { ProductService } from "@/services/productService";
import { Product, Auction, Category } from "@/contexts/DataContext";
import { SelectFilterConfig } from "../../AdminComponents/filters/types";

export type ProductSortOption =
    | "id-desc"
    | "id-asc"
    | "name-asc"
    | "name-desc"
    | "price-asc"
    | "price-desc"
    | "lot-asc"
    | "lot-desc";

interface UseServerPaginatedProductsProps {
    language: "en" | "sr";
    categories: Category[];
    auctions: Auction[];
    statusOptions: { value: string; labelEn: string; labelSr: string }[];
}

const isServerCompatibleSort = (sort: ProductSortOption) => true; // All defined are compatible

export const useServerPaginatedProducts = ({ language, categories, auctions, statusOptions }: UseServerPaginatedProductsProps) => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [auctionFilter, setAuctionFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<ProductSortOption>("id-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

    // All products from Firestore (for search/client mode and validation)
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const allProductsUnsubRef = useRef<(() => void) | null>(null);

    // Server mode state
    const [pageProducts, setPageProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const cursorCacheRef = useRef<Map<number, DocumentSnapshot>>(new Map());
    const unsubRef = useRef<(() => void) | null>(null);

    const isServerMode = searchQuery.trim() === "" && isServerCompatibleSort(sortBy);

    // Subscribe to all products (for client mode fallback and validation)
    useEffect(() => {
        allProductsUnsubRef.current = ProductService.subscribeAll((products) => {
            setAllProducts(products);
        });
        return () => {
            allProductsUnsubRef.current?.();
            allProductsUnsubRef.current = null;
        };
    }, []);

    // Derive total count from allProducts (real-time via subscribeAll)
    const totalCount = useMemo(() => {
        let count = allProducts.length;
        const filtered = allProducts.filter(p => {
            const statusMatch = statusFilter === "all" || p.status === statusFilter;
            const catMatch = categoryFilter === "all" || p.category === categoryFilter;
            const aucMatch = auctionFilter === "all" || p.auctionId.toString() === auctionFilter;
            return statusMatch && catMatch && aucMatch;
        });
        return filtered.length;
    }, [allProducts, statusFilter, categoryFilter, auctionFilter]);

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
                        const result = await ProductService.getPaginated(itemsPerPage, lastCursor, sortBy, statusFilter, categoryFilter, auctionFilter);
                        if (result.lastDoc) {
                            cursorCacheRef.current.set(p, result.lastDoc);
                            lastCursor = result.lastDoc;
                        }
                    }

                    if (cancelled) return;

                    const finalCursor = cursorCacheRef.current.get(currentPage - 1) ?? null;
                    unsubRef.current = ProductService.subscribePaginated(
                        itemsPerPage, finalCursor, sortBy, statusFilter, categoryFilter, auctionFilter,
                        ({ products, lastDoc }) => {
                            setPageProducts(products);
                            if (lastDoc) {
                                cursorCacheRef.current.set(currentPage, lastDoc);
                            }
                            if (products.length === 0 && currentPage > 1) {
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

        unsubRef.current = ProductService.subscribePaginated(
            itemsPerPage, cursor, sortBy, statusFilter, categoryFilter, auctionFilter,
            ({ products, lastDoc }) => {
                setPageProducts(products);
                if (lastDoc) {
                    cursorCacheRef.current.set(currentPage, lastDoc);
                }
                if (products.length === 0 && currentPage > 1) {
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
    }, [currentPage, itemsPerPage, sortBy, statusFilter, categoryFilter, auctionFilter, isServerMode]);

    // Cleanup when switching to client mode
    useEffect(() => {
        if (!isServerMode) {
            unsubRef.current?.();
            unsubRef.current = null;
            setLoading(false);
        }
    }, [isServerMode]);

    // Client mode: filter/sort/paginate allProducts
    const clientFilteredAndSorted = useMemo(() => {
        if (isServerMode) return [];
        return allProducts
            .filter((product) => {
                const searchLower = searchQuery.toLowerCase();
                const searchMatch =
                    searchQuery === "" ||
                    product.name.toLowerCase().includes(searchLower) ||
                    product.namesr.toLowerCase().includes(searchLower) ||
                    product.lot.toLowerCase().includes(searchLower);
                const statusMatch = statusFilter === "all" || product.status === statusFilter;
                const categoryMatch = categoryFilter === "all" || product.category === categoryFilter;
                const auctionMatch = auctionFilter === "all" || product.auctionId.toString() === auctionFilter;
                return searchMatch && statusMatch && categoryMatch && auctionMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case "name-asc":
                        return a.name.localeCompare(b.name);
                    case "name-desc":
                        return b.name.localeCompare(a.name);
                    case "price-asc":
                        return a.currentBid - b.currentBid;
                    case "price-desc":
                        return b.currentBid - a.currentBid;
                    case "lot-asc":
                        return a.lot.localeCompare(b.lot, undefined, { numeric: true });
                    case "lot-desc":
                        return b.lot.localeCompare(a.lot, undefined, { numeric: true });
                    case "id-asc":
                        return a.id - b.id;
                    case "id-desc":
                    default:
                        return b.id - a.id;
                }
            });
    }, [allProducts, statusFilter, categoryFilter, auctionFilter, searchQuery, sortBy, isServerMode]);

    // Computed values
    const effectiveTotalCount = isServerMode ? totalCount : clientFilteredAndSorted.length;
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage) || 1;
    const startIndex = Math.min((currentPage - 1) * itemsPerPage, effectiveTotalCount);
    const endIndex = Math.min(startIndex + itemsPerPage, effectiveTotalCount);

    const paginatedProducts = useMemo(() => {
        if (isServerMode) return pageProducts;
        return clientFilteredAndSorted.slice(startIndex, endIndex);
    }, [isServerMode, pageProducts, clientFilteredAndSorted, startIndex, endIndex]);

    const filteredAndSortedProducts = isServerMode ? pageProducts : clientFilteredAndSorted;

    // Handlers
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        cursorCacheRef.current.clear();
    }, []);

    const handleFilterChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        resetPagination();
        if (isServerMode) setPageProducts([]);
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
        setSortBy(value as ProductSortOption);
        resetPagination();
        if (isServerMode) setPageProducts([]);
    }, [resetPagination, isServerMode]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const selectFilters: SelectFilterConfig<string>[] = [
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
            key: "category",
            value: categoryFilter,
            onChange: (val: string) => handleFilterChange(setCategoryFilter, val),
            placeholder: language === "en" ? "Category" : "Kategorija",
            options: [
                { value: "all", label: language === "en" ? "All Categories" : "Sve Kategorije" },
                ...categories.map((cat) => ({ value: cat.id, label: cat.title[language] })),
            ],
        },
        {
            key: "auction",
            value: auctionFilter,
            onChange: (val: string) => handleFilterChange(setAuctionFilter, val),
            placeholder: language === "en" ? "Auction" : "Aukcija",
            options: [
                { value: "all", label: language === "en" ? "All Auctions" : "Sve Auctions" },
                ...auctions.map((auction) => ({ value: auction.id.toString(), label: auction.title[language] })),
            ],
        },
        {
            key: "sort",
            value: sortBy,
            onChange: handleSortChange,
            placeholder: language === "en" ? "Sort by" : "Sortiraj po",
            options: [
                { value: "id-desc", label: language === "en" ? "Newest First" : "Najnovije Prvo" },
                { value: "id-asc", label: language === "en" ? "Oldest First" : "Najstarije Prvo" },
                { value: "name-asc", label: language === "en" ? "Name A-Z" : "Ime A-Ž" },
                { value: "name-desc", label: language === "en" ? "Name Z-A" : "Ime Ž-A" },
                { value: "price-asc", label: language === "en" ? "Price: Low to High" : "Cena: Rastuće" },
                { value: "price-desc", label: language === "en" ? "Price: High to Low" : "Cena: Opadajuće" },
                { value: "lot-asc", label: language === "en" ? "Lot # Ascending" : "Lot # Rastuće" },
                { value: "lot-desc", label: language === "en" ? "Lot # Descending" : "Lot # Opadajuće" },
            ],
        },
    ];

    return {
        selectFilters,
        statusFilter,
        setStatusFilter: (val: string) => handleFilterChange(setStatusFilter, val),
        categoryFilter,
        setCategoryFilter: (val: string) => handleFilterChange(setCategoryFilter, val),
        auctionFilter,
        setAuctionFilter: (val: string) => handleFilterChange(setAuctionFilter, val),
        searchQuery,
        setSearchQuery: handleSearchChange,
        sortBy,
        setSortBy: handleSortChange,
        currentPage,
        setCurrentPage: handlePageChange,
        itemsPerPage,
        setItemsPerPage: handleItemsPerPageChange,
        ITEMS_PER_PAGE_OPTIONS,
        filteredProducts: filteredAndSortedProducts,
        paginatedProducts,
        totalPages,
        totalCount: effectiveTotalCount,
        startIndex,
        endIndex,
        loading,
        allProducts,
        resetPagination,
    };
};
