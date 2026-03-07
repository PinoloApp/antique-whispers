import React from "react";
import { ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LotImageUploadProps {
    language: "en" | "sr";
    tempId: string;
    image: string;
    hasError: boolean;
    onUpload: (tempId: string, file: File) => void;
    onRemove: (tempId: string) => void;
    inputRef: (el: HTMLInputElement | null) => void;
}

const getLotImageBorderClass = (hasError: boolean, hasImage: boolean) => {
    if (hasError && !hasImage) {
        return "border-destructive text-destructive";
    }
    return "border-border text-muted-foreground hover:border-primary hover:text-primary";
};

export const LotImageUpload = React.memo(({ tempId, image, hasError, onUpload, onRemove, inputRef }: LotImageUploadProps) => {
    const { t } = useLanguage();

    // Use a local ref to trigger click on visually hidden input
    const localInputRef = React.useRef<HTMLInputElement | null>(null);

    const setRefs = React.useCallback((el: HTMLInputElement | null) => {
        localInputRef.current = el;
        inputRef(el);
    }, [inputRef]);

    const handleClick = React.useCallback(() => {
        localInputRef.current?.click();
    }, []);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onUpload(tempId, e.target.files[0]);
        }
        e.target.value = "";
    }, [onUpload, tempId]);

    const handleRemove = React.useCallback(() => {
        onRemove(tempId);
    }, [onRemove, tempId]);

    const borderClass = getLotImageBorderClass(hasError, !!image);

    return (
        <div>
            <div className="flex items-center gap-3">
                {image ? (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                        <img src={image} alt="Lot" className="w-full h-full object-cover" />
                        <button type="button" onClick={handleRemove} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleClick}
                        className={`w-16 h-16 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-0.5 transition-colors ${borderClass}`}
                    >
                        <ImagePlus className="w-4 h-4" />
                        <span className="text-[9px]">{t("image")} *</span>
                    </button>
                )}
                <input
                    ref={setRefs}
                    type="file" accept="image/*" className="hidden"
                    onChange={handleChange}
                />
                <span className="text-xs text-muted-foreground">{t("requiredOneImage")}</span>
            </div>
            {hasError && !image && <p className="text-xs text-destructive mt-1">{t("imageIsRequired")}</p>}
        </div>
    );
});
LotImageUpload.displayName = "LotImageUpload";
