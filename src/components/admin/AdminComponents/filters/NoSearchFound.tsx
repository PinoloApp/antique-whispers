import React from "react";

interface NoSearchFoundProps {
    title: string;
    description: string;
}

const NoSearchFound = ({ title, description }: NoSearchFoundProps) => {
    return (
        <div>
            <div className="bg-card rounded-lg border border-border p-8 md:p-12 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
};

export default React.memo(NoSearchFound);