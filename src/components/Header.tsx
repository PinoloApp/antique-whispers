import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, Settings, Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/authContexts';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import AuthDialog from '@/components/AuthDialog';
import logoAukcije from '@/assets/logoAukcije.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { userLoggedIn } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.faq', href: '/faq' },
    { key: 'nav.favorites', href: '/favorites' },
    { key: 'nav.about', href: '/about' },
    { key: 'nav.contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <img src={logoAukcije} alt="SFINK logo" className="w-10 h-10" />
            <span className="font-serif text-2xl font-semibold text-foreground hidden sm:block">
              SFINK
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.key}
                  to={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  {t(link.key)}
                </Link>
              ) : (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  {t(link.key)}
                </a>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {!userLoggedIn ? (
                <>
                  <AuthDialog
                    defaultTab="login"
                    triggerLabel={language === 'en' ? 'Login' : 'Prijava'}
                    variant="ghost"
                  />
                  <AuthDialog
                    defaultTab="register"
                    triggerLabel={language === 'en' ? 'Register' : 'Registracija'}
                    variant="default"
                  />
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" className="gap-2" title={language === 'en' ? 'Admin Panel' : 'Kontrolna tabla'}>
                        {language === 'en' ? 'Admin Panel' : 'Kontrolna tabla'}
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/notifications">
                    <Button variant="ghost" size="icon" className="relative" title={language === 'en' ? 'Notifications' : 'Obaveštenja'}>
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-background" />
                      )}
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" title={language === 'en' ? 'Profile' : 'Profil'}>
                      <UserCircle className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase font-medium">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  <span className={language === 'en' ? 'font-semibold' : ''}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('sr')}>
                  <span className={language === 'sr' ? 'font-semibold' : ''}>Srpski</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.key}
                    to={link.href}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t(link.key)}
                  </Link>
                ) : (
                  <a
                    key={link.key}
                    href={link.href}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t(link.key)}
                  </a>
                )
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              {!userLoggedIn ? (
                <>
                  <AuthDialog
                    defaultTab="login"
                    triggerLabel={language === 'en' ? 'Login' : 'Prijava'}
                    variant="outline"
                  />
                  <AuthDialog
                    defaultTab="register"
                    triggerLabel={language === 'en' ? 'Register' : 'Registracija'}
                    variant="default"
                  />
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="flex-1">
                      <Button variant="secondary" className="w-full gap-2">
                        {language === 'en' ? 'Admin Panel' : 'Kontrolna tabla'}
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/notifications" className="flex-1">
                    <Button variant="secondary" className="w-full gap-2 relative">
                      <Bell className="w-4 h-4" />
                      {language === 'en' ? 'Notifications' : 'Obaveštenja'}
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-secondary" />
                      )}
                    </Button>
                  </Link>
                  <Link to="/profile" className="flex-1">
                    <Button variant="secondary" className="w-full gap-2">
                      <UserCircle className="w-4 h-4" />
                      {language === 'en' ? 'Profile' : 'Profil'}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
