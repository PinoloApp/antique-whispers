import React from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Product, Collection, Category } from "@/contexts/DataContext";
import { LotsSection } from "./LotsSection";
import { CollectionsSection } from "./CollectionsSection";
import { BidStepsSection } from "./BidStepsSection";
import { useAuctionForm } from "./hooks/useAuctionForm";

export type AuctionFormType = ReturnType<typeof useAuctionForm>;

export interface AuctionFormModalProps extends AuctionFormType {
    language: "en" | "sr";
    categories: Category[];
    products: Product[];
    collections: Collection[];
    collectionProducts: Product[];
    isMutating?: boolean;
    disabled?: boolean;
}

export const AuctionFormModal: React.FC<AuctionFormModalProps> = ({
    language,
    categories,
    products,
    collections,
    collectionProducts,
    isMutating,
    isOpen,
    setIsOpen,
    editingAuction,
    formData,
    setFormData,
    selectedLots,
    setSelectedLots,
    selectedCollections,
    setSelectedCollections,
    bidSteps,
    setBidSteps,
    collectionSearch,
    setCollectionSearch,
    formLotSearch,
    setFormLotSearch,
    lotsExpanded,
    setLotsExpanded,
    stepsExpanded,
    setStepsExpanded,
    collectionsExpanded,
    setCollectionsExpanded,
    expandedCategories,
    expandedSubcategories,
    expandedColCategories,
    expandedColSubcategories,
    formTouched,
    resetForm,
    handleSubmit,
    markFormTouched,
    getErr,
    getDateError,
    toggleCategory,
    toggleSubcategory,
    toggleLot,
    selectAllInCategory,
    deselectAllInCategory,
    selectAllInSubcategory,
    deselectAllInSubcategory,
    isCategoryFullySelected,
    isSubcategoryFullySelected,
    availableProducts,
    getFilteredCategoriesWithAvailableProducts,
    getFilteredSubcategoriesWithAvailableProducts,
    getFilteredProductsBySubcategory,
    getFilteredProductsWithoutSubcategory,
    setExpandedColCategories,
    setExpandedColSubcategories,
    originalCollectionIds,
    disabled,
}) => {
    const isReadOnly = (editingAuction?.status as string === "cancelled" || editingAuction?.status as string === "closed") || !!disabled;

    const handleOpenChange = (open: boolean) => {
        if (!open && isMutating) return;
        setIsOpen(open);
        if (!open) resetForm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto" disabled={isMutating || disabled}>
                    <Plus className="w-4 h-4" />
                    {language === "en" ? "Add Auction" : "Dodaj Aukciju"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] h-[95vh] flex flex-col overflow-hidden" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>
                        {editingAuction
                            ? language === "en"
                                ? "Edit Auction"
                                : "Izmeni Aukciju"
                            : language === "en"
                                ? "Add New Auction"
                                : "Dodaj Novu Aukciju"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
                    {/* Form inputs - animated hide/show */}
                    <div
                        className={`space-y-4 transition-all duration-300 ease-in-out ${lotsExpanded || stepsExpanded || collectionsExpanded ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[1000px] opacity-100"
                            }`}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Title (SR)" : "Naslov (SR)"}</label>
                                <Input
                                    value={formData.titleSr}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titleSr: e.target.value }))}
                                    onBlur={() => markFormTouched("titleSr")}
                                    required
                                    disabled={isReadOnly}
                                />
                                {getErr("titleSr", formData.titleSr) && (
                                    <p className="text-xs text-destructive mt-1">{getErr("titleSr", formData.titleSr)}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Title (EN)" : "Naslov (EN)"}</label>
                                <Input
                                    value={formData.titleEn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                    onBlur={() => markFormTouched("titleEn")}
                                    required
                                    disabled={isReadOnly}
                                />
                                {getErr("titleEn", formData.titleEn) && (
                                    <p className="text-xs text-destructive mt-1">{getErr("titleEn", formData.titleEn)}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Description (SR)" : "Opis (SR)"}
                                </label>
                                <Textarea
                                    value={formData.descriptionSr}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionSr: e.target.value }))}
                                    onBlur={() => markFormTouched("descSr")}
                                    required
                                    disabled={isReadOnly}
                                />
                                {getErr("descSr", formData.descriptionSr) && (
                                    <p className="text-xs text-destructive mt-1">{getErr("descSr", formData.descriptionSr)}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Description (EN)" : "Opis (EN)"}
                                </label>
                                <Textarea
                                    value={formData.descriptionEn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                                    onBlur={() => markFormTouched("descEn")}
                                    required
                                    disabled={isReadOnly}
                                />
                                {getErr("descEn", formData.descriptionEn) && (
                                    <p className="text-xs text-destructive mt-1">{getErr("descEn", formData.descriptionEn)}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-center">
                                    {language === "en" ? "Start Date" : "Datum Početka"}
                                </label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    onBlur={() => markFormTouched("startDate")}
                                    disabled={isReadOnly || editingAuction?.status === "active" || editingAuction?.status === "paused"}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {getDateError("startDate") && (
                                    <p className="text-xs text-destructive mt-1">{getDateError("startDate")}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Start Time" : "Vreme Početka"}</label>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                    onBlur={() => markFormTouched("startTime")}
                                    disabled={isReadOnly || editingAuction?.status === "active" || editingAuction?.status === "paused"}
                                    min={formData.startDate === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                                />
                                {getDateError("startTime") && (
                                    <p className="text-xs text-destructive mt-1">{getDateError("startTime")}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "End Date" : "Datum Završetka"}</label>
                                <Input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    onBlur={() => markFormTouched("endDate")}
                                    disabled={isReadOnly}
                                />
                                {getDateError("endDate") && (
                                    <p className="text-xs text-destructive mt-1">{getDateError("endDate")}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "End Time" : "Vreme Završetka"}</label>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                    onBlur={() => markFormTouched("endTime")}
                                    disabled={isReadOnly}
                                />
                                {getDateError("endTime") && (
                                    <p className="text-xs text-destructive mt-1">{getDateError("endTime")}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Lots Section */}
                    <LotsSection
                        language={language}
                        lotsExpanded={lotsExpanded}
                        setLotsExpanded={setLotsExpanded}
                        setStepsExpanded={setStepsExpanded}
                        setCollectionsExpanded={setCollectionsExpanded}
                        selectedLots={selectedLots}
                        formLotSearch={formLotSearch}
                        setFormLotSearch={setFormLotSearch}
                        expandedCategories={expandedCategories}
                        expandedSubcategories={expandedSubcategories}
                        availableProducts={availableProducts}
                        toggleCategory={toggleCategory}
                        toggleSubcategory={toggleSubcategory}
                        toggleLot={toggleLot}
                        selectAllInCategory={selectAllInCategory}
                        deselectAllInCategory={deselectAllInCategory}
                        selectAllInSubcategory={selectAllInSubcategory}
                        deselectAllInSubcategory={deselectAllInSubcategory}
                        isCategoryFullySelected={isCategoryFullySelected}
                        isSubcategoryFullySelected={isSubcategoryFullySelected}
                        getFilteredCategoriesWithAvailableProducts={getFilteredCategoriesWithAvailableProducts}
                        getFilteredSubcategoriesWithAvailableProducts={getFilteredSubcategoriesWithAvailableProducts}
                        getFilteredProductsBySubcategory={(categoryId, subcategoryId) => getFilteredProductsBySubcategory(categoryId, subcategoryId)}
                        getFilteredProductsWithoutSubcategory={getFilteredProductsWithoutSubcategory}
                        disabled={isReadOnly}
                    />

                    {/* Collections Section */}
                    <CollectionsSection
                        language={language}
                        categories={categories}
                        products={collectionProducts}
                        collections={collections}
                        collectionsExpanded={collectionsExpanded}
                        setCollectionsExpanded={setCollectionsExpanded}
                        setLotsExpanded={setLotsExpanded}
                        setStepsExpanded={setStepsExpanded}
                        selectedCollections={selectedCollections}
                        setSelectedCollections={setSelectedCollections}
                        collectionSearch={collectionSearch}
                        setCollectionSearch={setCollectionSearch}
                        expandedColCategories={expandedColCategories}
                        expandedColSubcategories={expandedColSubcategories}
                        setExpandedColCategories={setExpandedColCategories}
                        setExpandedColSubcategories={setExpandedColSubcategories}
                        originalCollectionIds={originalCollectionIds}
                        disabled={isReadOnly}
                    />

                    {/* Bid Steps Section */}
                    <BidStepsSection
                        language={language}
                        stepsExpanded={stepsExpanded}
                        setStepsExpanded={setStepsExpanded}
                        setLotsExpanded={setLotsExpanded}
                        setCollectionsExpanded={setCollectionsExpanded}
                        bidSteps={bidSteps}
                        setBidSteps={setBidSteps}
                        disabled={isReadOnly}
                    />
                </form>
                <div className="pt-4 border-t mt-auto">
                    <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isMutating || isReadOnly}>
                        {editingAuction
                            ? language === "en" ? "Update Auction" : "Ažuriraj Aukciju"
                            : language === "en" ? "Create Auction" : "Kreiraj Aukciju"}
                    </Button>
                </div>
                {isMutating && (
                    <div className="absolute inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
