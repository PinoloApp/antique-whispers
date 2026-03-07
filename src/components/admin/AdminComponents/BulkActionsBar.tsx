import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import DropDown from "./DropDown";

interface BulkActionsBarProps {
    showBar: boolean;
    totalSelected: number;
    bulkActions: Array<{
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        className?: string;
        action: () => void;
        count: number;
        visible: boolean;
    }>;
    dropDownActions?: Array<{
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        count: number;
    }>;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ bulkActions, totalSelected, showBar, dropDownActions }) => {
    const { t } = useLanguage();
    return (
        <div className={`rounded-lg border mb-4 px-4 py-3 ${showBar ? "border-border" : "border-transparent"}`}>
            {showBar ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                        {totalSelected} {t("selected")}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {dropDownActions?.length > 0 && dropDownActions?.map((action) => (
                            <DropDown key={action.label} Icon={action.icon} dropDownActions={dropDownActions} label={action.label} />
                        ))}
                        {bulkActions.map((action) => (
                            action.visible && (
                                <Button key={action.label} variant="outline" size="sm" className={action?.className} onClick={action.action}>
                                    <action.icon className="w-4 h-4" />
                                    {`${action.label} (${action.count})`}
                                </Button>
                            )
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-9" />
            )}
        </div>
    );
};

export default React.memo(BulkActionsBar);