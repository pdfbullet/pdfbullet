import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// Define the shape of the context
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Define supported languages - this list is now the single source of truth
export const supportedLanguages = [
    { code: 'ca', name: 'Català' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'zh-TW', name: '中文 (繁體)' },
    { code: 'de', name: 'Deutsch' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'ne', name: 'नेपाली' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'sv', name: 'Svenska' },
    { code: 'th', name: 'ภาษาไทย' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'uk', name: 'Українська' },
    { code: 'vi', name: 'Tiếng Việt' },
];


export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
      // Get saved locale or default to English
      return localStorage.getItem('locale') || 'en';
  });
  const [translations, setTranslations] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/locales/${locale}.json`);
        if (!response.ok) {
          throw new Error(`Could not load ${locale}.json`);
        }
        const data = await response.json();
        setTranslations(data);
        // Set document direction for RTL languages
        document.documentElement.dir = ['ar'].includes(locale) ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
      } catch (error) {
        console.error("Failed to load translations:", error);
        // Fallback to English if the selected language file fails to load
        if (locale !== 'en') {
            const response = await fetch(`/locales/en.json`);
            const data = await response.json();
            setTranslations(data);
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, [locale]);

  // Function to set the locale and save it
  const setLocale = (newLocale: string) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  };

  // The translation function `t`
  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    if (!key) return '';
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to the key itself if not found
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof result === 'string' && replacements) {
        Object.keys(replacements).forEach(rKey => {
            const regex = new RegExp(`{${rKey}}`, 'g');
            result = result.replace(regex, String(replacements[rKey]));
        });
    }

    return result || key;
  }, [translations]);

  const value = { locale, setLocale, t };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use the context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};