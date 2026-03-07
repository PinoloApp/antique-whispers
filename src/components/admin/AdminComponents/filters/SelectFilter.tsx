import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

type SelectOption = {
    value: string;
    label: string;
    count?: number;
};

interface SelectFilterProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    placeholder?: string;
    options: SelectOption[];
}

const SelectFilter = <T extends string>({
    value,
    onChange,
    placeholder,
    options,
}: SelectFilterProps<T>) => {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as T)}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        {option.count !== undefined && ` (${option.count})`}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default React.memo(SelectFilter);