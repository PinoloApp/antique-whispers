export const FILTER_CONFIG = {
    status: (language: "en" | "sr", counts: any) => [
        { value: "all", label: language === "en" ? "All" : "Sve", count: counts.total },
        { value: "active", label: language === "en" ? "Active" : "Aktivne", count: counts.active },
        { value: "inactive", label: language === "en" ? "Inactive" : "Neaktivne", count: counts.inactive },
    ],
    sort: (language: "en" | "sr") => [
        { value: "newest", label: language === "en" ? "Newest First" : "Najnovije Prvo" },
        { value: "oldest", label: language === "en" ? "Oldest First" : "Najstarije Prvo" },
        { value: "name-asc", label: language === "en" ? "Name (A-Z)" : "Naziv (A-Ž)" },
        { value: "name-desc", label: language === "en" ? "Name (Z-A)" : "Naziv (Ž-A)" },
        { value: "item-desc", label: language === "en" ? "Most Subcategories" : "Najviše Podkategorija" },
        { value: "item-asc", label: language === "en" ? "Least Subcategories" : "Najmanje Podkategorija" },
    ],
    collectionSort: (language: "en" | "sr") => [
        { value: "newest", label: language === "en" ? "Newest First" : "Najnovije Prvo" },
        { value: "oldest", label: language === "en" ? "Oldest First" : "Najstarije Prvo" },
        { value: "name-asc", label: language === "en" ? "Name A-Ž" : "Naziv A-Ž" },
        { value: "name-desc", label: language === "en" ? "Name Ž-A" : "Naziv Ž-A" },
        { value: "price-asc", label: language === "en" ? "Price Low-High" : "Cena Niska-Visoka" },
        { value: "price-desc", label: language === "en" ? "Price High-Low" : "Cena Visoka-Niska" },
    ],
    collectionStatus: (language: "en" | "sr") => [
        { value: "all", label: language === "en" ? "All Statuses" : "Svi Statusi" },
        { value: "available", label: language === "en" ? "Available" : "Dostupna" },
        { value: "on_auction", label: language === "en" ? "On Auction" : "Na Aukciji" },
        { value: "sold", label: language === "en" ? "Sold" : "Prodato" },
    ],
    userRole: (language: "en" | "sr") => [
        { value: "all", label: language === "en" ? "All Roles" : "Sve Uloge" },
        { value: "admin", label: language === "en" ? "Admin" : "Administrator" },
        { value: "user", label: language === "en" ? "User" : "Korisnik" },
    ],
    userStatus: (language: "en" | "sr") => [
        { value: "all", label: language === "en" ? "All Statuses" : "Svi Statusi" },
        { value: "active", label: language === "en" ? "Active" : "Aktivni" },
        { value: "banned", label: language === "en" ? "Banned" : "Banovan" },
    ],
};