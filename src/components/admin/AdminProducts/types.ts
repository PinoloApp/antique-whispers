import { LotState, ProductStatus } from "@/contexts/DataContext";

export interface ProductFormData {
    name: string;
    namesr: string;
    descriptionEn: string;
    descriptionSr: string;
    lot: string;
    currentBid: string;
    category: string;
    subcategory: string;
    auctionId: string;
    catalogMark: string;
    lotState: LotState;
    status: ProductStatus;
    subtitleEn: string;
    subtitleSr: string;
    additionalTitleEn: string;
    additionalTitleSr: string;
    noteSubEn: string;
    noteSubSr: string;
}
