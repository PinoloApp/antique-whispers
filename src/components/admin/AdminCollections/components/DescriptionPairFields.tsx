import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FormField } from "./FormFields";

interface DescriptionPairFieldsProps {
    descSr: string;
    descEn: string;
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

export const DescriptionPairFields = React.memo((props: DescriptionPairFieldsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2">
            {!props.isLot ? (
                <>
                    <FormField label={props.srLabel} error={props.errorSr}>
                        <Textarea className="text-sm min-h-[60px] sm:min-h-[80px]" value={props.descSr} onChange={(e) => props.onChangeSr(e.target.value)} onBlur={props.onBlurSr} />
                    </FormField>
                    <FormField label={props.enLabel} error={props.errorEn}>
                        <Textarea className="text-sm min-h-[60px] sm:min-h-[80px]" value={props.descEn} onChange={(e) => props.onChangeEn(e.target.value)} onBlur={props.onBlurEn} />
                    </FormField>
                </>
            ) : (
                <>
                    <div>
                        <Input placeholder={props.srLabel} value={props.descSr} onChange={(e) => props.onChangeSr(e.target.value)} onBlur={props.onBlurSr} />
                        {props.errorSr && <p className="text-xs text-destructive mt-1">{props.errorSr}</p>}
                    </div>
                    <div>
                        <Input placeholder={props.enLabel} value={props.descEn} onChange={(e) => props.onChangeEn(e.target.value)} onBlur={props.onBlurEn} />
                        {props.errorEn && <p className="text-xs text-destructive mt-1">{props.errorEn}</p>}
                    </div>
                </>
            )}
        </div>
    );
});
DescriptionPairFields.displayName = "DescriptionPairFields";
