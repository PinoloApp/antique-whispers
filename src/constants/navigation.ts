export const NAV_LINKS = [
    { key: 'nav.home', href: '/' },
    { key: 'nav.faq', href: '/faq' },
    { key: 'nav.favorites', href: '/favorites' },
    { key: 'nav.about', href: '/about' },
    { key: 'nav.contact', href: '/contact' },
] as const;

export const STYLES = {
    header: "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border",
    container: "container mx-auto px-4",
    flexBetween: "flex items-center justify-between h-20",
    desktopNav: "hidden lg:flex items-center gap-8",
    actions: "flex items-center gap-4",
    desktopAuth: "hidden md:flex items-center gap-2",
    mobileMenu: "lg:hidden py-4 border-t border-border animate-fade-in",
    mobileNav: "flex flex-col gap-2",
    mobileAuth: "flex gap-2 mt-4 pt-4 border-t border-border",
    navLink: "text-muted-foreground hover:text-foreground transition-colors font-medium text-sm",
    mobileNavLink: "px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors",
} as const;
