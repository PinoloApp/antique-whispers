import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/authContexts';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNotifications } from '@/contexts/NotificationContext';

export const useHeaderState = () => {
    const { language, setLanguage, t } = useLanguage();
    const { userLoggedIn } = useAuth();
    const { isAdmin } = useAdminAuth();
    const { unreadCount } = useNotifications();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    const handleLanguageChange = useCallback((lang: 'en' | 'sr') => {
        setLanguage(lang);
    }, [setLanguage]);

    const authLabels = useMemo(() => ({
        login: language === 'en' ? 'Login' : 'Prijava',
        register: language === 'en' ? 'Register' : 'Registracija',
        adminPanel: language === 'en' ? 'Admin Panel' : 'Kontrolna tabla',
        notifications: language === 'en' ? 'Notifications' : 'Obaveštenja',
        profile: language === 'en' ? 'Profile' : 'Profil',
    }), [language]);

    return {
        language,
        t,
        userLoggedIn,
        isAdmin,
        unreadCount,
        isMenuOpen,
        toggleMenu,
        closeMenu,
        handleLanguageChange,
        authLabels,
    };
};
