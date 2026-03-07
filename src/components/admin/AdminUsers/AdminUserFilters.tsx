import { useLanguage } from "@/contexts/LanguageContext";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, UserStatus } from "@/types/adminUsers.types";
import { FILTER_ROLE_OPTIONS, FILTER_STATUS_OPTIONS } from "@/constants/adminUsers.constants";

interface AdminUserFiltersProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    filterRole: UserRole | "all";
    onRoleFilterChange: (val: UserRole | "all") => void;
    filterStatus: UserStatus | "all";
    onStatusFilterChange: (val: UserStatus | "all") => void;
    totalFiltered: number;
    totalPages: number;
    currentPage: number;
    startIndex: number;
    endIndex: number;
}

const AdminUserFilters = ({
    searchQuery,
    onSearchChange,
    filterRole,
    onRoleFilterChange,
    filterStatus,
    onStatusFilterChange,
    totalFiltered,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
}: AdminUserFiltersProps) => {
    const { language } = useLanguage();

    return (
        <>
            <div className="bg-card rounded-lg border border-border p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder={language === "en" ? "Search users..." : "Pretraži korisnike..."}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={filterRole} onValueChange={onRoleFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={language === "en" ? "Filter by role" : "Filtriraj po ulozi"} />
                        </SelectTrigger>
                        <SelectContent>
                            {FILTER_ROLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label[language]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={onStatusFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={language === "en" ? "Filter by status" : "Filtriraj po statusu"} />
                        </SelectTrigger>
                        <SelectContent>
                            {FILTER_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label[language]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                    <span>
                        {totalFiltered} {language === "en" ? "users found" : "korisnika pronađeno"}
                        {totalPages > 1 && (
                            <span className="ml-2">
                                ({language === "en" ? "Page" : "Stranica"} {currentPage} {language === "en" ? "of" : "od"} {totalPages})
                            </span>
                        )}
                    </span>
                    {totalPages > 1 && (
                        <span>
                            {language === "en" ? "Showing" : "Prikazano"} {startIndex + 1}-{Math.min(endIndex, totalFiltered)}{" "}
                            {language === "en" ? "of" : "od"} {totalFiltered}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminUserFilters;
