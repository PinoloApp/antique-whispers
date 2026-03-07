export type UserRole = "admin" | "user";
export type UserStatus = "active" | "banned";

export interface UserBidHistory {
    id: string;
    lotNumber: string;
    lotName: string;
    bidAmount: number;
    bidDate: Date;
    status: "won" | "outbid" | "active";
    auctionName: string;
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
