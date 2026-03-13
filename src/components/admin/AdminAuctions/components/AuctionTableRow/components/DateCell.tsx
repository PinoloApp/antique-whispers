import React from "react";
import { format } from "date-fns";

interface DateCellProps {
    date: string;
}

const formatDate = (date: string) => format(new Date(date), "MMM dd, yyyy");
const formatTime = (date: string) => format(new Date(date), "HH:mm");

export const DateCell: React.FC<DateCellProps> = React.memo(({ date }) => (
    <td className="px-6 py-4 text-muted-foreground">
        <div>{formatDate(date)}</div>
        <div className="text-xs">{formatTime(date)}</div>
    </td>
));

DateCell.displayName = "DateCell";
