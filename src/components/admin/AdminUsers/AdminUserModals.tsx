import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserDialogs } from "./components/UserDialogs";

const AdminUserModals = () => {
    const { language } = useLanguage();

    return <UserDialogs language={language as "en" | "sr"} />;
};

export default AdminUserModals;
