import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

interface ReusableAlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    cancelText?: string;
    actionText: string;
    onAction: () => void;
    actionClassName?: string;
    isMutating?: boolean;
    icon?: any;
}

const ReusableAlertDialog = React.memo(
    ({
        open,
        onOpenChange,
        title,
        description,
        cancelText,
        actionText,
        onAction,
        actionClassName,
        isMutating,
        icon: Icon,
    }: ReusableAlertDialogProps) => {
        const { language } = useLanguage();

        return (
            <AlertDialog open={open} onOpenChange={(val) => { if (!isMutating) onOpenChange(val); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-5 h-5 text-primary" />}
                            <AlertDialogTitle>{title}</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isMutating}>
                            {cancelText || (language === "en" ? "Cancel" : "Otkaži")}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={onAction} className={actionClassName} disabled={isMutating}>
                            {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {isMutating ? (language === "en" ? "Processing..." : "Obrada...") : actionText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }
);

ReusableAlertDialog.displayName = "ReusableAlertDialog";
export default ReusableAlertDialog;
