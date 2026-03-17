import { AuctionService } from "./auctionService";
import { ProductService } from "./productService";
import { CollectionService } from "./collectionService";
import { CollectionProductService } from "./collectionProductService";
import { CategoryService } from "./categoryService";
import { Product, Collection, Category } from "@/contexts/DataContext";

export class LotAssignmentService {
    /**
     * Finds the next available lot number for an auction by looking at the max 
     * existing lot number across all products and collections in that auction.
     */
    static async getNextLotNumber(auctionId: number): Promise<number> {
        if (!auctionId || auctionId === 0) return 1;

        try {
            const auction = await AuctionService.getById(auctionId);
            if (!auction) return 1;

            const allProducts = await ProductService.getAll();
            const allCollections = await CollectionService.getAll();

            const auctionProducts = allProducts.filter(p => auction.lotIds?.includes(p.id));
            const auctionCollections = allCollections.filter(c => auction.collectionIds?.includes(c.id));

            let maxLot = 0;

            auctionProducts.forEach(p => {
                const lotNum = parseInt(p.lot || "0", 10);
                if (!isNaN(lotNum) && lotNum > maxLot) maxLot = lotNum;
            });

            auctionCollections.forEach(c => {
                const lotNum = parseInt(c.lotNumber || "0", 10);
                if (!isNaN(lotNum) && lotNum > maxLot) maxLot = lotNum;
            });

            return maxLot + 1;
        } catch (error) {
            console.error(`Error calculating next lot number for auction ${auctionId}:`, error);
            return 1;
        }
    }

    /**
     * Assigns a specific lot number to an item and updates its status.
     * Also handles sub-products for collections.
     */
    static async assignLotToItem(
        auctionId: number, 
        itemId: number, 
        itemType: 'product' | 'collection', 
        lotNumber: number
    ): Promise<void> {
        const lotString = lotNumber.toString();

        if (itemType === 'product') {
            const product = await ProductService.getById(itemId);
            await ProductService.update(itemId, { 
                lot: lotString,
                status: 'on_auction',
                auctionId: auctionId,
                currentBid: product?.startingPrice || 0,
                hasBids: false
            });
        } else if (itemType === 'collection') {
            const collectionObj = await CollectionService.getById(itemId);
            await CollectionService.update(itemId, { 
                lotNumber: lotString,
                status: 'on_auction',
                auctionId: auctionId,
                currentBid: collectionObj?.startingPrice || 0,
                hasBids: false
            });

            const collections = await CollectionService.getAll();
            const collection = collections.find(c => c.id === itemId);
            if (collection && collection.productIds) {
                for (let i = 0; i < collection.productIds.length; i++) {
                    const expectedCatalogMark = `${lotString}-${i + 1}`;
                    await CollectionProductService.update(collection.productIds[i], {
                        lot: lotString,
                        catalogMark: expectedCatalogMark
                    });
                }
            }
        }
    }

    /**
     * Reassigns lot numbers sequentially for all products and collections
     * currently assigned to the given auction, ordering them by their category.
     */
    static async reassignLotsForAuction(auctionId: number): Promise<void> {
        if (!auctionId || auctionId === 0) return;

        try {
            // 1. Fetch the auction
            const auction = await AuctionService.getById(auctionId);
            if (!auction) {
                console.error(`Auction ${auctionId} not found.`);
                return;
            }

            // 2. Fetch all products and collections currently in this auction
            const allProducts = await ProductService.getAll();
            const allCollections = await CollectionService.getAll();
            
            const selectedProducts = allProducts.filter(p => auction.lotIds?.includes(p.id));
            const selectedCollections = allCollections.filter(c => auction.collectionIds?.includes(c.id));

            if (selectedProducts.length === 0 && selectedCollections.length === 0) {
                return; // Nothing to assign
            }

            // 3. Fetch categories to determine ordering
            const categories = await CategoryService.getAll();

            // 4. Flatten items into a single array for sorting
            const itemsToAssign = [
                ...selectedProducts.map(p => ({
                    type: 'product' as const,
                    id: p.id,
                    category: p.category,
                    productIds: [] as number[],
                })),
                ...selectedCollections.map(c => ({
                    type: 'collection' as const,
                    id: c.id,
                    category: c.category,
                    productIds: c.productIds || [],
                })),
            ];

            const getCategoryIndex = (catId: string) => {
                const idx = categories.findIndex(c => c.id === catId);
                return idx === -1 ? 99999 : idx; // Unknown categories go last
            };

            // 5. Sort by category index
            itemsToAssign.sort((a, b) => getCategoryIndex(a.category) - getCategoryIndex(b.category));

            let currentLotNumber = 1;

            // 6. Iterate and execute updates
            for (const item of itemsToAssign) {
                const lotString = currentLotNumber.toString();

                if (item.type === 'product') {
                    // Avoid unnecessary updates if the lot is already correct
                    const existingProduct = selectedProducts.find(p => p.id === item.id);
                    if (existingProduct && existingProduct.lot !== lotString) {
                        await ProductService.update(item.id, { lot: lotString });
                    }
                } else if (item.type === 'collection') {
                    const existingCollection = selectedCollections.find(c => c.id === item.id);
                    if (existingCollection && existingCollection.lotNumber !== lotString) {
                        await CollectionService.update(item.id, { lotNumber: lotString });
                    }

                    // Always verify/update inner products for collections just in case
                    if (item.productIds && Array.isArray(item.productIds)) {
                        for (let i = 0; i < item.productIds.length; i++) {
                            const expectedCatalogMark = `${lotString}-${i + 1}`;
                            await CollectionProductService.update(item.productIds[i], {
                                lot: lotString,
                                catalogMark: expectedCatalogMark
                            });
                        }
                    }
                }
                currentLotNumber++;
            }

            console.log(`Successfully reassigned lots for Auction ${auctionId}`);
        } catch (error) {
            console.error(`Failed to reassign lots for Auction ${auctionId}:`, error);
            throw error;
        }
    }
}
