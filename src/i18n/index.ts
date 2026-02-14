import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resources, languageOptions, translationWordMap } from './resources';

const STORAGE_KEY = '@app_language';

const languageDetector = {
    type: 'languageDetector' as const,
    async: true,
    detect: async (callback: (lang: string) => void) => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                callback(stored);
                return;
            }
        } catch {
            // ignore
        }
        callback('en');
    },
    init: () => {},
    cacheUserLanguage: async (lng: string) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, lng);
        } catch {
            // ignore
        }
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
        keySeparator: false,
        parseMissingKeyHandler: (key) => {
            const lang = i18n.language ?? 'en';
            if (lang === 'en') return key;
            return translateText(key, lang);
        },
    });

export const setAppLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
};

export const getLanguageOptions = () => languageOptions;

export const translateText = (text: string, language?: string) => {
    if (!text) return text;
    const lng = language ?? i18n.language ?? 'en';
    if (lng === 'en') return text;
    const map = translationWordMap[lng] || {};
    if (!map || Object.keys(map).length === 0) return text;
    return text.replace(/\b[A-Za-z']+\b/g, (word) => {
        const lower = word.toLowerCase();
        const replacement = map[lower];
        if (!replacement) return word;
        if (word[0] === word[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
    });
};

export default i18n;
