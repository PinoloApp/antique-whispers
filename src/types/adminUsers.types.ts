export type UserRole = "admin" | "user";
export type UserStatus = "active" | "banned";

export interface UserBidHistory {
    id: string;
    lotNumber: string;
    lotName: string;
    bidAmount: number;
    bidDate: Date;
    status: "won" | "lost" | "active" | "cancelled" | "paused";
    auctionName: string;
    productId: number;
    auctionId: number;
    itemType: "lot" | "collection";
    image: string;
    auctionDate: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    lastLoginAt?: Date;
    totalBids: number;
    wonAuctions: number;
    bidHistory?: UserBidHistory[];
}
