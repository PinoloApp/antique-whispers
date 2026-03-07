import React, { createContext, useContext, useState } from "react";
import { FilterValue } from "./types";

type FiltersState = Record<string, FilterValue>;

interface FiltersContextType {
    filters: FiltersState;
    setFilter: (key: string, value: FilterValue) => void;
    resetFilters: () => void;
}

const FiltersContext = createContext<FiltersContextType | null>(null);

export const FiltersProvider: React.FC<{
    initialState?: FiltersState;
    children: React.ReactNode;
}> = ({ initialState = {}, children }) => {
    const [filters, setFilters] = useState<FiltersState>(initialState);

    const setFilter = (key: string, value: FilterValue) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const resetFilters = () => {
        setFilters(initialState);
    };

    return (
        <FiltersContext.Provider
            value={{ filters, setFilter, resetFilters }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

export const useFilters = () => {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error("useFilters must be used inside FiltersProvider");
    }
    return context;
};