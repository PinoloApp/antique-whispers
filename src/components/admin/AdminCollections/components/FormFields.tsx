import React from "react";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
    label: string;
    required?: boolean;
    error: string | null | undefined;
    children: React.ReactNode;
}

export const FormField = React.memo(({ label, required, error, children }: FormFieldProps) => {
    return (
        <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium">
                {label} {required && "*"}
            </label>
            {children}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
});
FormField.displayName = "FormField";

interface NamePairFieldsProps {
    nameSr: string;
    nameEn: string;
    srLabel: string;
    enLabel: string;
    onChangeSr: (val: string) => void;
    onChangeEn: (val: string) => void;
    onBlurSr: () => void;
    onBlurEn: () => void;
    errorSr: string | null | undefined;
    errorEn: string | null | undefined;
    isLot?: boolean;
}

export const NamePairFields = React.memo((props: NamePairFieldsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2">
            {!props.isLot ? (
                <>
                    <FormField label={props.srLabel} required error={props.errorSr}>
                        <Input className="h-9 sm:h-10 text-sm" value={props.nameSr} onChange={(e) => props.onChangeSr(e.target.value)} onBlur={props.onBlurSr} required />
                    </FormField>
                    <FormField label={props.enLabel} required error={props.errorEn}>
                        <Input className="h-9 sm:h-10 text-sm" value={props.nameEn} onChange={(e) => props.onChangeEn(e.target.value)} onBlur={props.onBlurEn} required />
                    </FormField>
                </>
            ) : (
                <>
                    <div>
                        <Input placeholder={props.srLabel} value={props.nameSr} onChange={(e) => props.onChangeSr(e.target.value)} onBlur={props.onBlurSr} />
                        {props.errorSr && <p className="text-xs text-destructive mt-1">{props.errorSr}</p>}
                    </div>
                    <div>
                        <Input placeholder={props.enLabel} value={props.nameEn} onChange={(e) => props.onChangeEn(e.target.value)} onBlur={props.onBlurEn} />
                        {props.errorEn && <p className="text-xs text-destructive mt-1">{props.errorEn}</p>}
                    </div>
                </>
            )}
        </div>
    );
});
NamePairFields.displayName = "NamePairFields";
