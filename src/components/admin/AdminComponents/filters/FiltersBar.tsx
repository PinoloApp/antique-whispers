import React from "react";
import { useFilters } from "./FiltersContext";
import { FilterDefinition } from "./types";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FiltersBarProps {
    definitions: FilterDefinition[];
}

const FiltersBar: React.FC<FiltersBarProps> = ({
    definitions,
}) => {
    const { filters, setFilter } = useFilters();

    return (
        <div className="bg-card rounded-lg border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {definitions.map((def) => {
                    const value = filters[def.key] ?? "";

                    if (def.type === "search") {
                        return (
                            <div key={def.key} className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        value={value as string}
                                        placeholder={def.placeholder}
                                        onChange={(e) =>
                                            setFilter(def.key, e.target.value)
                                        }
                                        className="pl-10 pr-9"
                                    />
                                    {value && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                            onClick={() => setFilter(def.key, "")}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    if (def.type === "select" && def.options) {
                        return (
                            <Select
                                key={def.key}
                                value={value as string}
                                onValueChange={(v) =>
                                    setFilter(def.key, v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={def.placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {def.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default React.memo(FiltersBar);