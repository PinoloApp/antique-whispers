import React from 'react';
import { Link } from 'react-router-dom';
import { STYLES } from '@/constants/navigation';

interface NavLinkProps {
    href: string;
    label: string;
    isMobile?: boolean;
    onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, isMobile, onClick }) => {
    const className = isMobile ? STYLES.mobileNavLink : STYLES.navLink;

    // Use Link for internal routes, a tag for external (though all current are internal)
    const isInternal = href.startsWith('/');

    if (isInternal) {
        return (
            <Link to={href} className={className} onClick={onClick}>
                {label}
            </Link>
        );
    }

    return (
        <a href={href} className={className} onClick={onClick}>
            {label}
        </a>
    );
};

export default React.memo(NavLink);
