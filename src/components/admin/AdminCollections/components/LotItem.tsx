import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineLot } from "../hooks/useCollectionForm";
import { NamePairFields } from "./FormFields";
import { DescriptionPairFields } from "./DescriptionPairFields";
import { LotImageUpload } from "./LotImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";

interface LotItemProps {
    language: "en" | "sr";
    lot: InlineLot;
    index: number;
    errorNameSr: string | null | undefined;
    errorNameEn: string | null | undefined;
    errorDescSr: string | null | undefined;
    errorDescEn: string | null | undefined;
    hasImageError: boolean;
    onUpdateLot: (tempId: string, field: keyof InlineLot, value: string) => void;
    onBlurField: (tempId: string, field: string) => void;
    onRemoveLot: (tempId: string) => void;
    onImageUpload: (tempId: string, file: File) => void;
    setLotImageRef: (tempId: string, el: HTMLInputElement | null) => void;
}

export const LotItem = React.memo((props: LotItemProps) => {
    const {
        language, lot, index, errorNameSr, errorNameEn, errorDescSr, errorDescEn, hasImageError,
        onUpdateLot, onBlurField, onRemoveLot, onImageUpload, setLotImageRef
    } = props;

    const { t } = useLanguage();

    const handleChangeNameSr = React.useCallback((val: string) => onUpdateLot(lot.tempId, "nameSr", val), [lot.tempId, onUpdateLot]);
    const handleChangeNameEn = React.useCallback((val: string) => onUpdateLot(lot.tempId, "nameEn", val), [lot.tempId, onUpdateLot]);
    const handleChangeDescSr = React.useCallback((val: string) => onUpdateLot(lot.tempId, "descriptionSr", val), [lot.tempId, onUpdateLot]);
    const handleChangeDescEn = React.useCallback((val: string) => onUpdateLot(lot.tempId, "descriptionEn", val), [lot.tempId, onUpdateLot]);

    const handleBlurNameSr = React.useCallback(() => onBlurField(lot.tempId, "nameSr"), [lot.tempId, onBlurField]);
    const handleBlurNameEn = React.useCallback(() => onBlurField(lot.tempId, "nameEn"), [lot.tempId, onBlurField]);
    const handleBlurDescSr = React.useCallback(() => onBlurField(lot.tempId, "descriptionSr"), [lot.tempId, onBlurField]);
    const handleBlurDescEn = React.useCallback(() => onBlurField(lot.tempId, "descriptionEn"), [lot.tempId, onBlurField]);

    const handleRemoveClick = React.useCallback(() => onRemoveLot(lot.tempId), [lot.tempId, onRemoveLot]);

    const handleImageUpload = React.useCallback((id: string, file: File) => onImageUpload(lot.tempId, file), [lot.tempId, onImageUpload]);
    const handleImageRemove = React.useCallback((id: string) => onUpdateLot(lot.tempId, "image", ""), [lot.tempId, onUpdateLot]);
    const handleRef = React.useCallback((el: HTMLInputElement | null) => setLotImageRef(lot.tempId, el), [lot.tempId, setLotImageRef]);


    return (
        <div className="p-4 bg-muted/30 rounded-lg mb-3">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                    {t("lot")} {index + 1}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveClick}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>

            <NamePairFields
                isLot
                nameSr={lot.nameSr} nameEn={lot.nameEn}
                srLabel={t("nameSrLot")} enLabel={t("nameEnLot")}
                onChangeSr={handleChangeNameSr} onChangeEn={handleChangeNameEn}
                onBlurSr={handleBlurNameSr} onBlurEn={handleBlurNameEn}
                errorSr={errorNameSr} errorEn={errorNameEn}
            />

            <DescriptionPairFields
                isLot
                descSr={lot.descriptionSr} descEn={lot.descriptionEn}
                srLabel={t("descriptionSrLot")} enLabel={t("descriptionEnLot")}
                onChangeSr={handleChangeDescSr} onChangeEn={handleChangeDescEn}
                onBlurSr={handleBlurDescSr} onBlurEn={handleBlurDescEn}
                errorSr={errorDescSr} errorEn={errorDescEn}
            />

            <LotImageUpload
                language={language}
                tempId={lot.tempId}
                image={lot.image}
                hasError={hasImageError}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
                inputRef={handleRef}
            />
        </div>
    );
});
LotItem.displayName = "LotItem";
