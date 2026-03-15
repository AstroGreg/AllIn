var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/Theme';
const THEME_STORAGE_KEY = '@app_theme';
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');
    const [isLoading, setIsLoading] = useState(true);
    // Load saved theme on mount
    useEffect(() => {
        loadTheme();
    }, []);
    const loadTheme = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const savedTheme = yield AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setMode(savedTheme);
            }
        }
        catch (error) {
            console.log('Error loading theme:', error);
        }
        finally {
            setIsLoading(false);
        }
    });
    const setTheme = (newMode) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
            setMode(newMode);
        }
        catch (error) {
            console.log('Error saving theme:', error);
        }
    });
    const toggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setTheme(newMode);
    };
    const colors = mode === 'dark' ? darkColors : lightColors;
    const isDark = mode === 'dark';
    const value = {
        mode,
        colors,
        isDark,
        setTheme,
        toggleTheme,
    };
    // Show nothing while loading to prevent flash
    if (isLoading) {
        return null;
    }
    return (_jsx(ThemeContext.Provider, Object.assign({ value: value }, { children: children })));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
export default ThemeContext;
