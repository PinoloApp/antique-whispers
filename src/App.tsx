import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useRef } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/authContexts";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import LotDetail from "./pages/LotDetail";
import CollectionDetail from "./pages/CollectionDetail";
import FAQ from "./pages/FAQ";
import Favorites from "./pages/Favorites";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if:
    // 1. Navigation is PUSH (new page)
    // 2. AND Pathname changed (not just search params)
    if (navType === "PUSH" && pathname !== prevPathname.current) {
      window.scrollTo(0, 0);
    }
    prevPathname.current = pathname;
  }, [pathname, navType]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <DataProvider>
          <NotificationProvider>
            <FavoritesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/lot/:id" element={<LotDetail />} />
                    <Route path="/collection/:id" element={<CollectionDetail />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </DataProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
