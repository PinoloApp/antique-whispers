import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product, Category, Auction } from "@/contexts/DataContext";
import { isAuctionActiveOrUpcoming } from "@/utils/auctionUtils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProductStatus } from "@/contexts/DataContext";

interface ProductMobileCardProps {
    product: Product;
    language: "en" | "sr";
    isSelected: boolean;
    categories: Category[];
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[];
    onSelect: (id: number) => void;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
    onStatusChange: (product: Product, newStatus: ProductStatus) => void;
    auctions: Auction[];
}

export const ProductMobileCard: React.FC<ProductMobileCardProps> = ({
    product,
    language,
    isSelected,
    categories,
    statusOptions,
    onSelect,
    onEdit,
    onDelete,
    onStatusChange,
    auctions,
}) => {
    const isLocked = isAuctionActiveOrUpcoming(product.auctionId, auctions);

    return (
        <div
            className={`bg-card border border-border rounded-lg p-4 space-y-4 ${isSelected ? "ring-2 ring-primary" : ""
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(product.id)}
                    />
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded object-cover"
                    />
                    <div>
                        <div className="font-medium text-foreground">
                            {language === "en" ? product.name : product.namesr}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Lot #{product.lot}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="text-muted-foreground">
                        {language === "en" ? "Category:" : "Kategorija:"}
                    </span>{" "}
                    <span className="font-medium">
                        {categories.find((c) => c.id === product.category)?.title[language] || product.category}
                    </span>
                </div>
                <div>
                    <span className="text-muted-foreground">
                        {language === "en" ? "Starting:" : "Početna:"}
                    </span>{" "}
                    <span className="font-medium">
                        €{product.currentBid.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
                <Select
                    value={product.status}
                    onValueChange={(value) => onStatusChange(product, value as ProductStatus)}
                >
                    <SelectTrigger
                        className={`w-[140px] h-8 text-xs ${product.status === "available"
                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                            : product.status === "sold"
                                ? "bg-red-500/20 text-red-600 border-red-500/30"
                                : product.status === "withdrawn"
                                    ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                    : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                            }`}
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={opt.value}
                                disabled={
                                    opt.value === "on_auction" ||
                                    (isLocked && opt.value !== "withdrawn" && opt.value !== product.status)
                                }
                            >
                                {language === "en" ? opt.labelEn : opt.labelSr}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {language === "en" ? "Edit" : "Izmeni"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(product.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            {language === "en" ? "Delete" : "Obriši"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
