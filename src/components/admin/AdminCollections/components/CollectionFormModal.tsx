import React from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCollectionForm } from "../hooks/useCollectionForm";
import { useCategories } from "@/hooks/useCategories";
import { useLanguage } from "@/contexts/LanguageContext";
import { FormField, NamePairFields } from "./FormFields";
import { DescriptionPairFields } from "./DescriptionPairFields";
import { CollectionImageUpload } from "./CollectionImageUpload";
import { CategorySelector } from "./CategorySelector";
import { LotItem } from "./LotItem";

interface CollectionFormModalProps {
    language: "en" | "sr";
    formHook: ReturnType<typeof useCollectionForm>;
}

export const CollectionFormModal: React.FC<CollectionFormModalProps> = ({ language, formHook }) => {
    const { categories } = useCategories();
    const { t } = useLanguage();

    const {
        isOpen,
        setIsOpen,
        editingCollection,
        formData,
        setFormData,
        collectionImage,
        setCollectionImage,
        inlineLots,
        formTouched,
        markFormTouched,
        collectionImageRef,
        lotImageRefs,
        resetForm,
        addInlineLot,
        updateInlineLot,
        removeInlineLot,
        handleLotImageUpload,
        handleCollectionImageUpload,
        handleSubmit,
        getErr,
        getLotErr,
        getPairErr,
        priceRule,
        isSubmitting
    } = formHook;

    const handleOpenChange = React.useCallback((open: boolean) => {
        if (!open && isSubmitting) return; // Prevent closing while submitting
        setIsOpen(open);
        if (!open) resetForm();
    }, [setIsOpen, resetForm, isSubmitting]);

    const handleChangeNameSr = React.useCallback((val: string) => setFormData(prev => ({ ...prev, nameSr: val })), [setFormData]);
    const handleChangeNameEn = React.useCallback((val: string) => setFormData(prev => ({ ...prev, nameEn: val })), [setFormData]);
    const handleBlurNameSr = React.useCallback(() => markFormTouched("nameSr"), [markFormTouched]);
    const handleBlurNameEn = React.useCallback(() => markFormTouched("nameEn"), [markFormTouched]);

    const handleChangeDescSr = React.useCallback((val: string) => setFormData(prev => ({ ...prev, descriptionSr: val })), [setFormData]);
    const handleChangeDescEn = React.useCallback((val: string) => setFormData(prev => ({ ...prev, descriptionEn: val })), [setFormData]);
    const handleBlurDescSr = React.useCallback(() => markFormTouched("descSr"), [markFormTouched]);
    const handleBlurDescEn = React.useCallback(() => markFormTouched("descEn"), [markFormTouched]);

    const handleChangeLotNumber = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, lotNumber: e.target.value })), [setFormData]);
    const handleBlurLotNumber = React.useCallback(() => markFormTouched("lotNumber"), [markFormTouched]);

    const handleChangeStartingPrice = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, startingPrice: e.target.value })), [setFormData]);
    const handleBlurStartingPrice = React.useCallback(() => markFormTouched("startingPrice"), [markFormTouched]);

    const handleChangeCategory = React.useCallback((v: string) => setFormData(prev => ({ ...prev, category: v, subcategory: "" })), [setFormData]);
    const handleChangeSubcategory = React.useCallback((v: string) => setFormData(prev => ({ ...prev, subcategory: v })), [setFormData]);

    const handleRemoveCollectionImage = React.useCallback(() => setCollectionImage(""), [setCollectionImage]);

    const handleLotBlur = React.useCallback((tempId: string, field: string) => {
        markFormTouched(`lot_${tempId}_${field}`);
    }, [markFormTouched]);

    const setLotImageRef = React.useCallback((tempId: string, el: HTMLInputElement | null) => {
        lotImageRefs.current[tempId] = el;
    }, [lotImageRefs]);

    const handleCancelClick = React.useCallback(() => {
        setIsOpen(false);
        resetForm();
    }, [setIsOpen, resetForm]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    {t("addCollection")}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden" aria-describedby={undefined}>
                <div className="flex flex-col h-full max-h-[95vh] overflow-y-auto p-6" data-collection-form>
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            {editingCollection ? t("editCollection") : t("addNewCollection")}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
                        <div className="space-y-4">
                            <NamePairFields
                                nameSr={formData.nameSr} nameEn={formData.nameEn}
                                srLabel={t("nameSrLabel")} enLabel={t("nameEnLabel")}
                                onChangeSr={handleChangeNameSr} onChangeEn={handleChangeNameEn}
                                onBlurSr={handleBlurNameSr} onBlurEn={handleBlurNameEn}
                                errorSr={getErr("nameSr", formData.nameSr)} errorEn={getErr("nameEn", formData.nameEn)}
                            />

                            <DescriptionPairFields
                                descSr={formData.descriptionSr} descEn={formData.descriptionEn}
                                srLabel={t("descriptionSrLabel")} enLabel={t("descriptionEnLabel")}
                                onChangeSr={handleChangeDescSr} onChangeEn={handleChangeDescEn}
                                onBlurSr={handleBlurDescSr} onBlurEn={handleBlurDescEn}
                                errorSr={getPairErr("descSr", formData.descriptionSr, formData.descriptionEn)}
                                errorEn={getPairErr("descEn", formData.descriptionEn, formData.descriptionSr)}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2">
                                <FormField label={t("lotNumberLabel")} required error={getErr("lotNumber", formData.lotNumber)}>
                                    <Input className="h-9 sm:h-10 text-sm" value={formData.lotNumber} onChange={handleChangeLotNumber} onBlur={handleBlurLotNumber} placeholder="LOT-K001" required />
                                </FormField>
                                <FormField label={t("startingPriceLabel")} required error={getErr("startingPrice", formData.startingPrice, priceRule)}>
                                    <Input className="h-9 sm:h-10 text-sm" type="number" min="0" step="0.01" value={formData.startingPrice} onChange={handleChangeStartingPrice} onBlur={handleBlurStartingPrice} required />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2">
                                <CategorySelector
                                    language={language}
                                    categories={categories}
                                    selectedCategory={formData.category}
                                    selectedSubcategory={formData.subcategory}
                                    onChangeCategory={handleChangeCategory}
                                    onChangeSubcategory={handleChangeSubcategory}
                                />
                            </div>
                        </div>

                        <CollectionImageUpload
                            language={language}
                            image={collectionImage}
                            inputRef={collectionImageRef}
                            onUpload={handleCollectionImageUpload}
                            onRemove={handleRemoveCollectionImage}
                        />

                        {/* Lots */}
                        <div className="border-t border-border pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">
                                    {t("lotsInCollection")} *
                                </h4>
                                {inlineLots.length === 0 && (
                                    <Button type="button" variant="outline" size="sm" onClick={addInlineLot}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        {t("add")}
                                    </Button>
                                )}
                            </div>
                            {formTouched["noLots"] && inlineLots.length === 0 && (
                                <p className="text-xs text-destructive mb-3">
                                    {t("atLeastOneLotRequired")}
                                </p>
                            )}

                            {inlineLots.map((lot, index) => {
                                const errImg = formTouched[`lot_${lot.tempId}_image`] && !lot.image;
                                return (
                                    <LotItem
                                        key={lot.tempId}
                                        language={language}
                                        lot={lot}
                                        index={index}
                                        onUpdateLot={updateInlineLot}
                                        onRemoveLot={removeInlineLot}
                                        onImageUpload={handleLotImageUpload}
                                        onBlurField={handleLotBlur}
                                        setLotImageRef={setLotImageRef}
                                        errorNameSr={getLotErr(lot.tempId, "nameSr", lot.nameSr)}
                                        errorNameEn={getLotErr(lot.tempId, "nameEn", lot.nameEn)}
                                        errorDescSr={getLotErr(lot.tempId, "descriptionSr", lot.descriptionSr)}
                                        errorDescEn={getLotErr(lot.tempId, "descriptionEn", lot.descriptionEn)}
                                        hasImageError={!!errImg}
                                    />
                                );
                            })}
                            {inlineLots.length > 0 && (
                                <Button type="button" variant="outline" size="sm" className="w-full mt-3" onClick={addInlineLot}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    {t("addLot")}
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleCancelClick}>
                                {t("cancel")}
                            </Button>
                            <Button type="submit" className="w-full sm:w-auto">
                                {editingCollection ? t("updateCollectionBtn") : t("createCollectionBtn")}
                            </Button>
                        </div>
                    </form>
                </div>
                {isSubmitting && (
                    <div className="absolute inset-0 z-[51] flex justify-center items-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
