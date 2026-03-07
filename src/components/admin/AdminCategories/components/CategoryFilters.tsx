import React from "react";
import SearchBar from "../../AdminComponents/filters/SearchBar";
import { SelectFilterConfig } from "../../AdminComponents/filters/types";
import SelectFilter from "../../AdminComponents/filters/SelectFilter";

interface CategoryFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filteredCount: number;
    selectFilters: SelectFilterConfig<any>[];
    placeholder: string;
    itemsFoundText: string;

}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
    searchQuery,
    onSearchChange,
    filteredCount,
    selectFilters,
    placeholder,
    itemsFoundText
}) => {

    return (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={placeholder}
                />

                {selectFilters.map((filter) => (
                    <SelectFilter
                        key={filter.key}
                        value={filter.value}
                        onChange={filter.onChange}
                        placeholder={filter.placeholder}
                        options={filter.options}
                    />
                ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                <span>
                    {filteredCount} {itemsFoundText}
                </span>
            </div>
        </div>
    );
};

export default React.memo(CategoryFilters);
