import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface DirectSaleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    defaultAmount: number;
    onConfirm: (data: {
        firstName: string;
        lastName: string;
        email: string;
        amount: number;
    }) => void;
    isLoading?: boolean;
}

export const DirectSaleModal: React.FC<DirectSaleModalProps> = ({
    isOpen,
    onOpenChange,
    itemName,
    defaultAmount,
    onConfirm,
    isLoading
}) => {
    const { language } = useLanguage();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        amount: defaultAmount.toString()
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, amount: defaultAmount.toString() }));
        }
    }, [isOpen, defaultAmount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            amount: parseFloat(formData.amount) || 0
        });
    };

    const t = {
        title: language === "en" ? "Direct Sale Details" : "Podaci o direktnoj prodaji",
        description: language === "en" 
            ? `Enter buyer details for: ${itemName}`
            : `Unesite podatke o kupcu za: ${itemName}`,
        firstName: language === "en" ? "First Name" : "Ime",
        lastName: language === "en" ? "Last Name" : "Prezime",
        email: language === "en" ? "Email Address" : "E-mail adresa",
        amount: language === "en" ? "Sale Amount (€)" : "Iznos prodaje (€)",
        cancel: language === "en" ? "Cancel" : "Otkaži",
        confirm: language === "en" ? "Confirm Sale" : "Potvrdi prodaju",
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t.title}</DialogTitle>
                        <DialogDescription>{t.description}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                                {t.firstName}
                            </Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                                {t.lastName}
                            </Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                {t.email}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                {t.amount}
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="any"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            {t.cancel}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {t.confirm}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
