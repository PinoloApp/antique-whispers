export type FilterValue = string | number | boolean;

export type FilterDefinition = {
    key: string;
    type: "search" | "select";
    placeholder?: string;
    options?: { label: string; value: string }[];
};

export type SelectFilterConfig<T extends string> = {
    key: string;
    value: T;
    onChange: (value: T) => void;
    placeholder: string;
    options: {
        value: T;
        label: string;
        count?: number;
    }[];
};