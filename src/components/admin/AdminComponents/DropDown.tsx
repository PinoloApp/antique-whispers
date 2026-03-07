import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DropDownProps {
    Icon: React.ComponentType<{ className?: string }>;
    label: string;
    dropDownActions: Array<{
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        count: number;
        options?: Array<{
            icon: React.ComponentType<{ className?: string }>;
            label: string;
            value: string;
            action: (value: string) => void;
        }>;
    }>;
}

const DropDown: React.FC<DropDownProps> = ({ Icon, label, dropDownActions }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hover:bg-transparent hover:text-current">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {dropDownActions.map((action) => (
                    action.options?.map((option) => (
                        <DropdownMenuItem key={option.label} onClick={() => option.action(option.value)}>
                            <option.icon className="w-4 h-4 mr-2" />
                            {`${option.label}`}
                        </DropdownMenuItem>
                    ))
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default React.memo(DropDown);