import React from "react";
import { Pencil } from "lucide-react";
import { ActionMenuItem } from "./ActionMenuItem";

import { Auction } from "../../AuctionTableRow";

interface EditActionProps {
    auction: Auction;
    language: "en" | "sr";
    handleEdit: (auction: Auction) => void;
    withStop: (handler: () => void) => (e: React.MouseEvent) => void;
}

export const EditAction: React.FC<EditActionProps> = React.memo(({
    auction,
    language,
    handleEdit,
    withStop,
}) => (
    <>
        <ActionMenuItem
            icon={Pencil}
            label={language === "en" ? "Edit" : "Uredi"}
            onClick={withStop(() => handleEdit(auction))}
        />
    </>
));

EditAction.displayName = "EditAction";
