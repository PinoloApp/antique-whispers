import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    title: string;
    description: string;
    buttonText: string;
    icon: string;
    buttonAction: () => void;
}

const NoData = ({ title, description, buttonText, icon, buttonAction }: Props) => {
    return (
        <div className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-4">{description}</p>
            <Button onClick={buttonAction}>
                <Plus className="w-4 h-4 mr-2" />
                {buttonText}
            </Button>
        </div>
    );
};

export default React.memo(NoData);