import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSwitcherProps {
    language: string;
    onLanguageChange: (lang: 'en' | 'sr') => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onLanguageChange }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="uppercase font-medium">{language}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => onLanguageChange('en')}>
                    <span className={language === 'en' ? 'font-semibold' : ''}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange('sr')}>
                    <span className={language === 'sr' ? 'font-semibold' : ''}>Srpski</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default React.memo(LanguageSwitcher);
