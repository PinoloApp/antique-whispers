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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category, Product, Collection, Subcategory } from "@/contexts/DataContext";

interface CategoryMobileCardProps {
    category: Category;
    language: "en" | "sr";
    searchQuery: string;
    isSelected: boolean;
    isExpanded: boolean;
    hasMatchingSubcategory: boolean;
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

export const CategoryMobileCard = memo(
    ({
        category,
        language,
        searchQuery,
        isSelected,
        isExpanded,
        hasMatchingSubcategory,
        standaloneLots,
        collections,
        onSelect,
        onToggleExpand,
        onEdit,
        onToggleActive,
        onDelete,
        onMoveSubcategory,
        onToggleSubcategoryActive,
    }: CategoryMobileCardProps) => {
        return (
            <div className={`bg-card rounded-lg border border-border p-4 ${!category.isActive ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelect(category.id, checked as boolean, category.isActive)}
                        />
                        <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">{category.title[language]}</div>
                            <div className="text-xs text-muted-foreground truncate">{category.description[language]}</div>
                        </div>
                    </div>
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
                </div>
                <div className="flex justify-center items-center h-full mb-3">
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
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">
                        {language === "en" ? "Subcategories:" : "Podkategorije:"}{" "}
                        <span className="text-foreground">{category.subcategories.length}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                        <Package className="w-3 h-3" />{" "}
                        <span className="text-foreground">
                            {standaloneLots.filter((p) => p.category === category.id).length} {language === "en" ? "lots" : "lotova"}
                        </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                        <Layers className="w-3 h-3" />{" "}
                        <span className="text-foreground">
                            {collections.filter((c) => c.category === category.id).length}{" "}
                            {language === "en" ? "collections" : "kolekcija"}
                        </span>
                    </div>
                </div>

                {/* Expandable subcategories */}
                {category.subcategories.length > 0 && (
                    <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand(category.id)}>
                        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors">
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            {language === "en" ? "Subcategories" : "Podkategorije"}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-1">
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
                                        className={`flex items-center justify-between px-3 py-2 rounded transition-all text-sm ${isSubMatch ? "bg-primary/20 border border-primary/40 ring-1 ring-primary/20" : "bg-muted/30"} ${!sub.isActive ? "opacity-60" : ""}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${isSubMatch ? "text-primary" : "text-muted-foreground"}`}>
                                                {isSubMatch ? "→" : "•"}
                                            </span>
                                            <div>
                                                <span className="font-medium">{sub.title[language]}</span>
                                                <div className="text-xs text-muted-foreground">{sub.description[language]}</div>
                                            </div>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 mx-1">
                                                <Package className="w-3 h-3" />
                                                {
                                                    standaloneLots.filter((p) => p.category === category.id && p.subcategory === sub.id)
                                                        .length
                                                }
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
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
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </div>
        );
    }
);
