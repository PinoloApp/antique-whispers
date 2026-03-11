import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Package, FolderTree, Menu, Users, Globe, CreditCard, BarChart2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminAuctions from "@/components/admin/AdminAuctions";
import AdminProducts from "@/components/admin/AdminProducts/AdminProducts";
import AdminCategories from "@/components/admin/AdminCategories/components/AdminCategories";
import AdminUsers from "@/components/admin/AdminUsers/AdminUsers";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminCollections from "@/components/admin/AdminCollections/components/AdminCollections";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type AdminSection = "auctions" | "products" | "categories" | "collections" | "users" | "payments" | "analytics";

const Admin = () => {
  const { language, setLanguage } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeSection = (searchParams.get("tab") as AdminSection) || "auctions";

  const setActiveSection = (sectionId: AdminSection) => {
    setSearchParams({ tab: sectionId });
  };

  const sections = useMemo(() => [
    { id: "auctions" as const, icon: Calendar, label: { en: "Auctions", sr: "Aukcije" } },
    { id: "categories" as const, icon: FolderTree, label: { en: "Categories", sr: "Kategorije" } },
    { id: "products" as const, icon: Package, label: { en: "Products", sr: "Proizvodi" } },
    { id: "collections" as const, icon: Layers, label: { en: "Collections", sr: "Kolekcije" } },
    { id: "users" as const, icon: Users, label: { en: "Users", sr: "Korisnici" } },
    { id: "payments" as const, icon: CreditCard, label: { en: "Payments", sr: "Plaćanja" } },
    { id: "analytics" as const, icon: BarChart2, label: { en: "Analytics", sr: "Analitika" } },
  ], []);

  const handleSectionChange = (sectionId: AdminSection) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{language === "en" ? "Back to Site" : "Nazad na Sajt"}</span>
        </Link>
        <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground mt-4">
          {language === "en" ? "Admin Panel" : "Admin Panel"}
        </h1>
      </div>

      <nav className="flex-1 p-3 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => handleSectionChange(section.id)}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-colors ${activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label[language]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 md:p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{language}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => setLanguage("en")}>
              <span className={language === "en" ? "font-semibold" : ""}>English</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("sr")}>
              <span className={language === "sr" ? "font-semibold" : ""}>Srpski</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between md:hidden">
        <h1 className="font-serif text-lg font-bold text-foreground">
          {language === "en" ? "Admin Panel" : "Admin Panel"}
        </h1>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed h-full">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-20 md:pt-8 md:ml-64">
        {activeSection === "auctions" && <AdminAuctions />}
        {activeSection === "products" && <AdminProducts />}
        {activeSection === "categories" && <AdminCategories />}
        {activeSection === "collections" && <AdminCollections />}
        {activeSection === "users" && <AdminUsers />}
        {activeSection === "payments" && <AdminPayments />}
        {activeSection === "analytics" && <AdminAnalytics />}
      </main>
    </div>
  );
};

export default Admin;
