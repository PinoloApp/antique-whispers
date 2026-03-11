import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/AuthDialog';
import { STYLES } from '@/constants/navigation';

interface AuthActionsProps {
    userLoggedIn: boolean;
    isAdmin: boolean;
    unreadCount: number;
    authLabels: {
        login: string;
        register: string;
        adminPanel: string;
        notifications: string;
        profile: string;
    };
    isMobile?: boolean;
}

const AuthActions: React.FC<AuthActionsProps> = ({
    userLoggedIn,
    isAdmin,
    unreadCount,
    authLabels,
    isMobile
}) => {
    if (!userLoggedIn) {
        return (
            <div className={isMobile ? STYLES.mobileAuth : STYLES.desktopAuth}>
                <AuthDialog
                    defaultTab="login"
                    triggerLabel={authLabels.login}
                    variant={isMobile ? "outline" : "ghost"}
                />
                <AuthDialog
                    defaultTab="register"
                    triggerLabel={authLabels.register}
                    variant="default"
                />
            </div>
        );
    }

    const containerClass = isMobile ? "flex gap-2 mt-4 pt-4 border-t border-border" : STYLES.desktopAuth;
    const buttonVariant = isMobile ? "secondary" : "ghost";
    const buttonClass = isMobile ? "w-full gap-2" : "gap-2";

    return (
        <div className={containerClass}>
            {isAdmin ? (
                <Link to="/admin" className={isMobile ? "flex-1" : ""}>
                    <Button variant={buttonVariant} className={buttonClass} title={authLabels.adminPanel}>
                        {authLabels.adminPanel}
                        <Settings className="w-4 h-4" />
                    </Button>
                </Link>
            ) : (
                <Link to="/notifications" className={isMobile ? "flex-1" : ""}>
                    <Button
                        variant={buttonVariant}
                        size={isMobile ? "default" : "icon"}
                        className={`${buttonClass} relative`}
                        title={authLabels.notifications}
                    >
                        <Bell className="w-4 h-4" />
                        {isMobile && authLabels.notifications}
                        {unreadCount > 0 && (
                            <span className={`absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 ${isMobile ? 'border-secondary' : 'border-background'}`} />
                        )}
                    </Button>
                </Link>
            )}
            <Link to="/profile" className={isMobile ? "flex-1" : ""}>
                <Button variant={buttonVariant} size={isMobile ? "default" : "icon"} className={buttonClass} title={authLabels.profile}>
                    <UserCircle className="w-4 h-4" />
                    {isMobile && authLabels.profile}
                </Button>
            </Link>
        </div>
    );
};

export default React.memo(AuthActions);
