import React from "react";

interface Props {
    title: string;
    children: React.ReactNode;
}

const TitleHeader = ({ title, children }: Props) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                {title}
            </h2>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
};

export default React.memo(TitleHeader);