import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getPaginationPages } from "@/utils/adminUsers.utils";
import { ITEMS_PER_PAGE_OPTIONS } from "@/constants/adminUsers.constants";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (value: string) => void;
    perPageLabel: string;
    paginationLabel: string;
}

const PaginationControls = ({
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    perPageLabel,
    paginationLabel,
}: PaginationControlsProps) => {
    return (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{perPageLabel}</span>
                <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option.toString()}>{option}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1} className="h-8 w-8">
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                        {getPaginationPages(currentPage, totalPages).map((page, index, arr) => (
                            <div key={page} className="flex items-center">
                                {index > 0 && arr[index - 1] !== page - 1 && (
                                    <span className="px-2 text-muted-foreground">...</span>
                                )}
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => onPageChange(page)}
                                    className="h-8 w-8"
                                >
                                    {page}
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8">
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="text-sm text-muted-foreground">
                {paginationLabel}
            </div>
        </div>
    );
};

export default PaginationControls;