import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const FullPageSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAdmin, isLoading } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Nije admin i više se ne učitava — redirect na home, NE prikaži ništa od admin UI-a
        if (!isLoading && !isAdmin) {
            navigate("/", { replace: true });
        }
    }, [isAdmin, isLoading, navigate]);

    // Loading state — prikaži spinner, NE renderiraj children
    if (isLoading) {
        return <FullPageSpinner />;
    }

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
};
