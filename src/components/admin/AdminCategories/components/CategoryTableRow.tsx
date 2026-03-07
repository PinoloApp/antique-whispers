import React, { memo } from "react";
import {
    MoreHorizontal,
    Pencil,
    Power,
    PowerOff,
    Trash2,
    CheckCircle,
    XCircle,
    Package,
    Layers,
    ChevronDown,
    ChevronRight,
    ArrowRightLeft,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category, Product, Collection, Subcategory } from "@/contexts/DataContext";

interface CategoryTableRowProps {
    category: Category;
    language: "en" | "sr";
    searchQuery: string;
    isSelected: boolean;
    isExpanded: boolean;
    standaloneLots: Product[];
    collections: Collection[];
    onSelect: (id: string, checked: boolean, isActive: boolean) => void;
    onToggleExpand: (id: string) => void;
    onEdit: (category: Category) => void;
    onToggleActive: (category: Category) => void;
    onDelete: (id: string) => void;
    onMoveSubcategory: (sub: Subcategory, categoryId: string) => void;
    onToggleSubcategoryActive: (category: Category, subIndex: number) => void;
}

export const CategoryTableRow = memo(
    ({
        category,
        language,
        searchQuery,
        isSelected,
        isExpanded,
        standaloneLots,
        collections,
        onSelect,
        onToggleExpand,
        onEdit,
        onToggleActive,
        onDelete,
        onMoveSubcategory,
        onToggleSubcategoryActive,
    }: CategoryTableRowProps) => {
        return (
            <React.Fragment>
                <tr className={`hover:bg-muted/30 transition-colors ${!category.isActive ? "opacity-60" : ""}`}>
                    <td className="px-4 py-4">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelect(category.id, checked as boolean, category.isActive)}
                        />
                    </td>
                    <td className="px-6 py-4">
                        <button
                            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                            onClick={() => onToggleExpand(category.id)}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div>
                                <div className="font-medium text-foreground">{category.title[language]}</div>
                                <div className="text-xs text-muted-foreground">{category.description[language]}</div>
                            </div>
                        </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {category.isActive ? (
                            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === "en" ? "Active" : "Aktivna"}
                            </Badge>
                        ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                                <XCircle className="w-3 h-3 mr-1" />
                                {language === "en" ? "Inactive" : "Neaktivna"}
                            </Badge>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="bg-background text-foreground border-border">
                            {category.subcategories.length}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="bg-background text-foreground border-border">
                            <Package className="w-3 h-3 mr-1" />
                            {standaloneLots.filter((p) => p.category === category.id).length}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className="bg-background text-foreground border-border">
                            <Layers className="w-3 h-3 mr-1" />
                            {collections.filter((c) => c.category === category.id).length}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(category)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Edit" : "Uredi"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onToggleActive(category)}>
                                    {category.isActive ? (
                                        <>
                                            <PowerOff className="w-4 h-4 mr-2" />
                                            {language === "en" ? "Deactivate" : "Deaktiviraj"}
                                        </>
                                    ) : (
                                        <>
                                            <Power className="w-4 h-4 mr-2" />
                                            {language === "en" ? "Activate" : "Aktiviraj"}
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(category.id)} className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Delete" : "Obriši"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </td>
                </tr>
                {/* Expanded subcategories row */}
                {isExpanded && category.subcategories.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-0 py-0">
                            <div className="bg-muted/20 px-6 py-4 border-t border-border text-center text-sm text-muted-foreground">
                                {language === "en" ? "No subcategories" : "Nema podkategorija"}
                            </div>
                        </td>
                    </tr>
                )}
                {isExpanded && category.subcategories.length > 0 && (
                    <tr>
                        <td colSpan={7} className="px-0 py-0">
                            <div className="bg-muted/20 px-6 py-3 border-t border-border">
                                <div className="space-y-1">
                                    {category.subcategories.map((sub, subIndex) => {
                                        const isSubMatch =
                                            searchQuery.trim() !== "" &&
                                            (sub.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                sub.title.sr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                sub.description.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                sub.description.sr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                sub.id.toLowerCase().includes(searchQuery.toLowerCase()));
                                        return (
                                            <div
                                                key={sub.id}
                                                className={`flex items-center justify-between px-4 py-2 rounded transition-all ${isSubMatch ? "bg-primary/20 border border-primary/40 ring-1 ring-primary/20" : "hover:bg-muted/40"} ${!sub.isActive ? "opacity-60" : ""}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm ${isSubMatch ? "text-primary" : "text-muted-foreground"}`}>
                                                        {isSubMatch ? "→" : "•"}
                                                    </span>
                                                    <div>
                                                        <span
                                                            className={`text-sm font-medium ${isSubMatch ? "text-foreground" : "text-foreground"}`}
                                                        >
                                                            {sub.title[language]}
                                                        </span>
                                                        <div className="text-xs text-muted-foreground">{sub.description[language]}</div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Package className="w-3 h-3" />
                                                        {
                                                            standaloneLots.filter((p) => p.category === category.id && p.subcategory === sub.id)
                                                                .length
                                                        }
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Layers className="w-3 h-3" />
                                                        {
                                                            collections.filter((c) => c.category === category.id && c.subcategory === sub.id)
                                                                .length
                                                        }
                                                    </span>
                                                    {!sub.isActive && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs px-1.5 py-0">
                                                            {language === "en" ? "Inactive" : "Neaktivna"}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreHorizontal className="w-3 h-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onMoveSubcategory(sub, category.id)}>
                                                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                                                            {language === "en" ? "Move" : "Premesti"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onToggleSubcategoryActive(category, subIndex)}>
                                                            {sub.isActive ? (
                                                                <>
                                                                    <PowerOff className="w-4 h-4 mr-2" />
                                                                    {language === "en" ? "Deactivate" : "Deaktiviraj"}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Power className="w-4 h-4 mr-2" />
                                                                    {language === "en" ? "Activate" : "Aktiviraj"}
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    }
);
