import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export interface CategoryAttribute {
  id: string;
  name: { en: string; sr: string };
  type: 'text' | 'number' | 'select';
  options?: string[]; // For select type
  required?: boolean;
}

export interface Subcategory {
  id: string;
  key: string;
  title: { en: string; sr: string };
  description: { en: string; sr: string };
  isActive: boolean;
  parentCategoryId?: string; // For hierarchical structure
}

export interface Category {
  id: string;
  key: string;
  title: { en: string; sr: string };
  description: { en: string; sr: string };
  subcategories: Subcategory[];
  isActive: boolean;
  attributes: CategoryAttribute[];
  createdAt: Date;
}

export interface BidStep {
  fromAmount: number;
  toAmount: number;
  step: number;
}

export interface Auction {
  id: number;
  date: Date;
  startDate: Date;
  endDate: Date;
  title: { en: string; sr: string };
  description: { en: string; sr: string };
  status: 'upcoming' | 'active' | 'completed' | 'paused' | 'cancelled';
  lotIds: number[];
  collectionIds: number[];
  bidSteps: BidStep[];
  createdAt?: Date;
}

export type LotState = 'new' | 'used' | 'refurbished' | 'antique' | 'restored';
export type ProductStatus = 'available' | 'sold' | 'on_auction' | 'withdrawn';
export type CollectionStatus = 'available' | 'on_auction' | 'sold' | 'withdrawn';

export interface Collection {
  id: number;
  name: { en: string; sr: string };
  description: { en: string; sr: string };
  lotNumber: string;
  startingPrice: number;
  currentBid: number;
  productIds: number[];
  status: CollectionStatus;
  auctionId: number;
  category: string;
  subcategory: string;
  image?: string;
  hasBids?: boolean;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  namesr: string;
  description: { en: string; sr: string };
  lot: string;
  currentBid: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  auctionId: number;
  catalogMark: string;
  subtitle?: { en: string; sr: string };
  additionalTitle?: { en: string; sr: string };
  noteSub?: { en: string; sr: string };
  lotState: LotState;
  status: ProductStatus;
  startingPrice?: number;
  hasBids?: boolean;
}

export interface Bid {
  id: string;
  productId: number;
  auctionId: number;
  maxAmount: number; // Maximum amount the bidder is willing to pay
  currentAmount: number; // Current winning amount (calculated by proxy system)
  bidderName: string;
  bidderEmail: string;
  timestamp: Date;
  isWinning: boolean; // Whether this bid is currently winning
  isLiveAuction?: boolean; // Whether bid was placed at live auction
}

interface DataContextType {
  auctions: Auction[];
  products: Product[];
  collectionProducts: Product[];
  collections: Collection[];
  bids: Bid[];
  addProduct: (product: Product) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateCollection: (id: number, updates: Partial<Collection>) => Promise<void>;
  updateAuction: (id: number | string, updates: Partial<Auction>) => Promise<void>;
  getCollectionForProduct: (productId: number) => Collection | undefined;
  addBid: (bidData: { productId: number; auctionId: number; maxAmount: number; bidderName: string; bidderEmail?: string; isLiveAuction?: boolean }) => Promise<{ success: boolean; winning: boolean; currentPrice: number }>;
  getBidStepForAmount: (auctionId: number, amount: number) => number;
  getProductBids: (productId: number, auctionId: number) => Bid[];
}

const defaultBidSteps: BidStep[] = [
  { fromAmount: 0, toAmount: 99, step: 5 },
  { fromAmount: 100, toAmount: 999, step: 10 },
  { fromAmount: 1000, toAmount: Infinity, step: 50 },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

import { useCollections } from "../hooks/useCollections";
import { useProducts } from "../hooks/useProducts";
import { useCollectionProducts } from "../hooks/useCollectionProducts";
import { useAuctions } from "../hooks/useAuctions";
import { CollectionService } from "@/services/collectionService";
import { ProductService } from "@/services/productService";
import { BidService } from "@/services/bidService";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEffect } from "react";

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [bids, setBids] = useState<Bid[]>([]); // Bids will be populated only for admins or via manual fetch

  const { products } = useProducts();
  const { collectionProducts } = useCollectionProducts();
  const { collections } = useCollections();
  const { auctions, updateAuction } = useAuctions();

  const { isAdmin } = useAdminAuth();

  useEffect(() => {
    if (!isAdmin) {
      setBids([]);
      return;
    }

    const unsub = BidService.subscribeToAllBidsAdmin((newBids) => {
      setBids(newBids);
    });
    return () => unsub();
  }, [isAdmin]);

  const addProduct = (product: Product) => {
    ProductService.create(product);
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    await ProductService.update(id, updates);
  };

  const deleteProduct = (id: number) => {
    ProductService.delete(id);
  };

  const updateCollection = async (id: number, updates: Partial<Collection>) => {
    await CollectionService.update(id, updates);
  };

  const getCollectionForProduct = (productId: number): Collection | undefined => {
    return collections.find(c => c.productIds.includes(productId));
  };

  // Get bid step for a specific amount based on auction's bid steps
  const getBidStepForAmount = (auctionId: number, amount: number): number => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction || !auction.bidSteps || auction.bidSteps.length === 0) {
      // If no steps defined, we should ideally have a safe default or throw, 
      // but per user request, we should rely on defined steps.
      return 1; // Minimal fallback
    }

    const step = auction.bidSteps.find(s => amount >= s.fromAmount && amount <= s.toAmount);
    return step ? step.step : auction.bidSteps[auction.bidSteps.length - 1].step;
  };

  // Get all bids for a product in a specific auction
  const getProductBids = (productId: number, auctionId: number): Bid[] => {
    return bids.filter(b => b.productId === productId && b.auctionId === auctionId);
  };

  const addBid = async (bidData: { productId: number; auctionId: number; maxAmount: number; bidderName: string; bidderEmail?: string; isLiveAuction?: boolean }) => {
    try {
      const result = await BidService.placeBid(bidData);
      return result;
    } catch (error) {
      console.error("Error in addBid:", error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      auctions,
      products,
      collectionProducts,
      collections,
      bids,
      addProduct,
      updateProduct,
      deleteProduct,
      updateCollection,
      updateAuction,
      getCollectionForProduct,
      addBid,
      getBidStepForAmount,
      getProductBids,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
