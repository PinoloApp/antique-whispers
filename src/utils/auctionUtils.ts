import { Auction } from "@/contexts/DataContext";

/**
 * Checks if an auction is currently active or upcoming.
 * @param auctionId - The ID of the auction to check
 * @param auctions - List of all auctions
 * @returns boolean
 */
export const isAuctionActiveOrUpcoming = (auctionId: number, auctions: Auction[]): boolean => {
    if (!auctionId || auctionId === 0) return false;

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return false;

    return auction.status === 'active' || auction.status === 'upcoming';
};
