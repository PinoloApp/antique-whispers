import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

const Table = ({
    TABLE_COLUMNS,
    isAllSelected,
    handleSelectAllChange,
    language,
    children,
    showCheckbox = true,
}: {
    TABLE_COLUMNS: { key: string; label: { en: string; sr: string }; align: string }[];
    isAllSelected?: boolean;
    handleSelectAllChange?: (checked: boolean) => void;
    language: "en" | "sr";
    children: React.ReactNode;
    showCheckbox?: boolean;
}) => {
    return (
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            {showCheckbox && (
                                <th className="px-4 py-4 text-left w-10">
                                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAllChange} />
                                </th>
                            )}
                            {TABLE_COLUMNS.map(({ key, label, align }) => {
                                const hasPadding = /p[xyrlbt]-/.test(align) || /\bp-\d+/.test(align);
                                return (
                                    <th key={key} className={`${!hasPadding ? "px-6" : ""} py-4 ${align} text-sm font-medium text-muted-foreground`}>
                                        {label[language]}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    {children}
                </table>
            </div>
        </div>
    )
};

export default React.memo(Table);