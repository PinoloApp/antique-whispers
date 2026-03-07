import React from "react";
import { UserRole, UserStatus } from "@/types/adminUsers.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

interface UserFormDialogProps {
    mode: "create" | "edit";
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
    formData: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: UserRole;
        status: UserStatus;
    };
    setFormData: React.Dispatch<React.SetStateAction<UserFormDialogProps['formData']>>;
    formTouched: Record<string, boolean>;
    markFormTouched: (field: string) => void;
    handleFormSubmit: (e: React.FormEvent, onSuccess: () => void) => void;
    onConfirmOpen: () => void;
    formErrors: {
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
    };
    isMutating?: boolean;
}

const UserFormDialog = ({
    mode,
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    markFormTouched,
    handleFormSubmit,
    onConfirmOpen,
    formErrors,
    isMutating,
}: UserFormDialogProps) => {
    const { t } = useLanguage();

    const title = mode === "create" ? t("createUser") : t("editUser");
    const submitText = mode === "create" ? t("create") : t("saveChanges");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleFormSubmit(e, onConfirmOpen)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">{t("firstName")}</label>
                            <Input
                                value={formData.firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, firstName: e.target.value })}
                                onBlur={() => markFormTouched("firstName")}
                                required
                            />
                            {formErrors.firstName && <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">{t("lastName")}</label>
                            <Input
                                value={formData.lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lastName: e.target.value })}
                                onBlur={() => markFormTouched("lastName")}
                                required
                            />
                            {formErrors.lastName && <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            onBlur={() => markFormTouched("email")}
                            required
                        />
                        {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                        <label className="text-sm font-medium">{t("phoneOptional")}</label>
                        <Input
                            value={formData.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                            onBlur={() => markFormTouched("phone")}
                            placeholder="+381 64 123 4567"
                        />
                        {formErrors.phone && <p className="text-xs text-destructive mt-1">{formErrors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">{t("role")}</label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">{t("user")}</SelectItem>
                                    <SelectItem value="admin">{t("adminRole")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: UserStatus) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">{t("active")}</SelectItem>
                                    <SelectItem value="banned">{t("banned")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isMutating}>
                            {isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {isMutating ? t("loading") : submitText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserFormDialog;
