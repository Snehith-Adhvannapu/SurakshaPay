import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { INDIAN_LANGUAGES, type LanguageCode } from '@/lib/languages';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language as LanguageCode;
  const currentLangInfo = INDIAN_LANGUAGES[currentLanguage] || INDIAN_LANGUAGES['en'];

  const handleLanguageChange = async (langCode: LanguageCode) => {
    try {
      await i18n.changeLanguage(langCode);
      setIsOpen(false);
      
      // Store preference in localStorage
      localStorage.setItem('preferred-language', langCode);
      
      // Update document direction for RTL languages
      const isRTL = ['ur', 'ar'].includes(langCode);
      document.dir = isRTL ? 'rtl' : 'ltr';
      
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 min-w-[120px]"
          data-testid="button-language-selector"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLangInfo.nativeName}
          </span>
          <span className="sm:hidden">
            {currentLanguage.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 max-h-80 overflow-y-auto"
        data-testid="dropdown-language-options"
      >
        <div className="p-2 text-sm font-medium text-muted-foreground border-b">
          {t('common.selectLanguage')}
        </div>
        
        {Object.entries(INDIAN_LANGUAGES).map(([code, info]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as LanguageCode)}
            className={`flex items-center justify-between p-3 cursor-pointer ${
              currentLanguage === code ? 'bg-accent' : ''
            }`}
            data-testid={`language-option-${code}`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{info.nativeName}</span>
              <span className="text-xs text-muted-foreground">
                {info.name} • {info.script}
              </span>
            </div>
            {currentLanguage === code && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;