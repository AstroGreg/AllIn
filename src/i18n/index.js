var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resources, languageOptions, translationWordMap } from './resources';
const STORAGE_KEY = '@app_language';
const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: (callback) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const stored = yield AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                callback(stored);
                return;
            }
        }
        catch (_a) {
            // ignore
        }
        callback('en');
    }),
    init: () => { },
    cacheUserLanguage: (lng) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield AsyncStorage.setItem(STORAGE_KEY, lng);
        }
        catch (_b) {
            // ignore
        }
    }),
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
        var _a;
        const lang = (_a = i18n.language) !== null && _a !== void 0 ? _a : 'en';
        if (lang === 'en')
            return key;
        return translateText(key, lang);
    },
});
export const setAppLanguage = (language) => __awaiter(void 0, void 0, void 0, function* () {
    yield i18n.changeLanguage(language);
});
export const getLanguageOptions = () => languageOptions;
export const translateText = (text, language) => {
    var _a;
    if (!text)
        return text;
    const lng = (_a = language !== null && language !== void 0 ? language : i18n.language) !== null && _a !== void 0 ? _a : 'en';
    if (lng === 'en')
        return text;
    const map = translationWordMap[lng] || {};
    if (!map || Object.keys(map).length === 0)
        return text;
    return text.replace(/\b[A-Za-z']+\b/g, (word) => {
        const lower = word.toLowerCase();
        const replacement = map[lower];
        if (!replacement)
            return word;
        if (word[0] === word[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
    });
};
export default i18n;
