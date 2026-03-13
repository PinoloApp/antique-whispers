import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sub-components
import { EditAction } from "./AuctionActionsMenu/EditAction";
import { DeleteAction } from "./AuctionActionsMenu/DeleteAction";
import { StatusActions } from "./AuctionActionsMenu/StatusActions";

// ─── Types ────────────────────────────────────────────────────────────────────

import { Auction, AuctionActions, AuctionStatus, Language, AuctionForm } from "../AuctionTableRow";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const withStop = (handler: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    handler();
};

interface AuctionActionsMenuProps {
    auction: Auction;
    language: Language;
    auctionActions: AuctionActions;
    auctionForm: AuctionForm;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AuctionActionsMenu: React.FC<AuctionActionsMenuProps> = React.memo(({
    auction,
    language,
    auctionActions,
    auctionForm,
}) => {
    const { id, status } = auction;

    return (
        <td className="px-6 py-4 text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={withStop(() => { })}>
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    
                    {/* Render Edit Action if not completed */}
                    {status !== "completed" && (
                        <EditAction 
                            auction={auction} 
                            language={language} 
                            handleEdit={auctionForm.handleEdit} 
                            withStop={withStop} 
                        />
                    )}

                    {/* Render Status-specific Actions */}
                    <StatusActions 
                        status={status} 
                        auctionId={id} 
                        language={language} 
                        auctionActions={auctionActions} 
                        withStop={withStop} 
                    />

                    {/* Render Delete Action */}
                    <DeleteAction 
                        auctionId={id} 
                        language={language} 
                        handleDelete={auctionActions.handleDeleteClick} 
                        withStop={withStop} 
                    />

                </DropdownMenuContent>
            </DropdownMenu>
        </td>
    );
});

AuctionActionsMenu.displayName = "AuctionActionsMenu";