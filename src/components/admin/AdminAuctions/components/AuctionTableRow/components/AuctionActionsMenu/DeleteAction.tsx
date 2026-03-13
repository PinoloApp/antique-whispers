import React from "react";
import { Trash2 } from "lucide-react";
import { ActionMenuItem } from "./ActionMenuItem";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface DeleteActionProps {
    auctionId: number;
    language: "en" | "sr";
    handleDelete: (id: number) => void;
    withStop: (handler: () => void) => (e: React.MouseEvent) => void;
}

export const DeleteAction: React.FC<DeleteActionProps> = React.memo(({
    auctionId,
    language,
    handleDelete,
    withStop,
}) => (
    <>
        <DropdownMenuSeparator />
        <ActionMenuItem
            icon={Trash2}
            label={language === "en" ? "Delete" : "Obriši"}
            onClick={withStop(() => handleDelete(auctionId))}
            className="text-destructive"
        />
    </>
));

DeleteAction.displayName = "DeleteAction";
