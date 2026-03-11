import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoAukcije from '@/assets/logoAukcije.svg';

import { useHeaderState } from '@/hooks/useHeaderState';
import { NAV_LINKS, STYLES } from '@/constants/navigation';

import NavLink from './NavLink';
import AuthActions from './AuthActions';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
    const {
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
    } = useHeaderState();

    return (
        <header className={STYLES.header}>
            <div className={STYLES.container}>
                <div className={STYLES.flexBetween}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logoAukcije} alt="SFINK logo" className="w-10 h-10" />
                        <span className="font-serif text-2xl font-semibold text-foreground hidden sm:block">
                            SFINK
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={STYLES.desktopNav}>
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.key}
                                href={link.href}
                                label={t(link.key)}
                            />
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className={STYLES.actions}>
                        {/* Auth Buttons - Desktop */}
                        <AuthActions
                            userLoggedIn={userLoggedIn}
                            isAdmin={isAdmin}
                            unreadCount={unreadCount}
                            authLabels={authLabels}
                        />

                        {/* Language Switcher */}
                        <LanguageSwitcher
                            language={language}
                            onLanguageChange={handleLanguageChange}
                        />

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={STYLES.mobileMenu}>
                        {/* Mobile Nav Links */}
                        <nav className={STYLES.mobileNav}>
                            {NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.key}
                                    href={link.href}
                                    label={t(link.key)}
                                    isMobile
                                    onClick={closeMenu}
                                />
                            ))}
                        </nav>

                        {/* Mobile Auth Buttons */}
                        <AuthActions
                            userLoggedIn={userLoggedIn}
                            isAdmin={isAdmin}
                            unreadCount={unreadCount}
                            authLabels={authLabels}
                            isMobile
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default React.memo(Header);
