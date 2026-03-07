import React, { memo } from "react";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    Package,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category, Product, Collection, CollectionStatus } from "@/contexts/DataContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CollectionTableRowProps {
    collection: Collection;
    language: "en" | "sr";
    isSelected: boolean;
    isExpanded: boolean;
    collectionProducts: (Product | undefined)[];
    categories: Category[];
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[];
    onStatusChange: (collection: Collection, newStatus: CollectionStatus) => void;
    onSelect: (id: number) => void;
    onToggleExpand: (id: number) => void;
    onEdit: (collection: Collection) => void;
    onDelete: (id: number) => void;
}

export const CollectionTableRow = memo(
    ({
        collection,
        language,
        isSelected,
        isExpanded,
        collectionProducts,
        categories,
        statusOptions,
        onStatusChange,
        onSelect,
        onToggleExpand,
        onEdit,
        onDelete,
    }: CollectionTableRowProps) => {
        return (
            <React.Fragment>
                <tr className={`hover:bg-muted/30 transition-colors ${isSelected ? "bg-muted/50" : ""}`}>
                    <td className="px-4 py-4 w-10">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onSelect(collection.id)}
                        />
                    </td>
                    <td className="px-6 py-4">
                        <button
                            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity font-medium max-w-[200px]"
                            onClick={() => onToggleExpand(collection.id)}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate">{collection.name[language]}</span>
                        </button>
                    </td>
                    <td className="px-6 py-4">{collection.lotNumber}</td>
                    <td className="px-6 py-4">
                        {(() => {
                            const cat = categories.find((c) => c.id === collection.category);
                            return cat ? cat.title[language] : <span className="text-muted-foreground">-</span>;
                        })()}
                    </td>
                    <td className="px-6 py-4">
                        <Select
                            value={collection.status}
                            onValueChange={(value) => onStatusChange(collection, value as CollectionStatus)}
                        >
                            <SelectTrigger
                                className={`w-[130px] h-8 text-xs ${collection.status === "available"
                                    ? "bg-green-500/20 text-green-600 border-green-500/30"
                                    : collection.status === "sold"
                                        ? "bg-red-500/20 text-red-600 border-red-500/30"
                                        : collection.status === "withdrawn"
                                            ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                            : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                    }`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} disabled={opt.value === "on_auction"}>
                                        {language === "en" ? opt.labelEn : opt.labelSr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </td>
                    <td className="px-6 py-4">€{collection.startingPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                        <Badge variant="outline">
                            <Package className="w-3 h-3 mr-1" />
                            {collection.productIds.length}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(collection)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Edit" : "Izmeni"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(collection.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Delete" : "Obriši"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </td>
                </tr>
                {isExpanded && (
                    <tr>
                        <td colSpan={8} className="px-0 py-0">
                            <div className="bg-muted/20 px-6 py-3 border-t border-border">
                                {collectionProducts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        {language === "en" ? "No lots in this collection" : "Nema lotova u ovoj kolekciji"}
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {collectionProducts.map((product) => product && (
                                            <div key={product.id} className="flex items-center justify-between px-4 py-2 rounded hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-muted-foreground">•</span>
                                                    {product.image && (
                                                        <img src={product.image} alt={language === "en" ? product.name : product.namesr} className="w-8 h-8 rounded object-cover" />
                                                    )}
                                                    <div>
                                                        <span className="text-sm font-medium">{language === "en" ? product.name : product.namesr}</span>
                                                        <div className="text-xs text-muted-foreground">Lot {product.lot}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    }
);
