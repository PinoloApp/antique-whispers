import React from "react";
import { Upload, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CollectionImageUploadProps {
    language: "en" | "sr";
    image: string;
    onUpload: (file: File) => void;
    onRemove: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
}

export const CollectionImageUpload = React.memo(({ image, onUpload, onRemove, inputRef }: CollectionImageUploadProps) => {
    const { t } = useLanguage();

    const handleClick = React.useCallback(() => {
        inputRef.current?.click();
    }, [inputRef]);

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onUpload(e.target.files[0]);
        }
        e.target.value = "";
    }, [onUpload]);

    return (
        <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">{t("collectionImageLabel")}</label>
            {image ? (
                <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden border border-border">
                        <img src={image} alt="Collection" className="w-full h-full object-cover" />
                        <button type="button" onClick={onRemove} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    className="w-full rounded-lg border-2 border-dashed border-border py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">{t("clickToUploadCollection")}</span>
                    <span className="text-xs text-muted-foreground">{t("maxOneImageOptional")}</span>
                </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </div>
    );
});
CollectionImageUpload.displayName = "CollectionImageUpload";
