import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemeColors, lightColors, darkColors } from '../constants/Theme';

const THEME_STORAGE_KEY = '@app_theme';

interface ThemeContextType {
    mode: ThemeMode;
    colors: ThemeColors;
    isDark: boolean;
    setTheme: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('light');
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme on mount
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setMode(savedTheme);
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setTheme = async (newMode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
            setMode(newMode);
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setTheme(newMode);
    };

    const colors = mode === 'dark' ? darkColors : lightColors;
    const isDark = mode === 'dark';

    const value: ThemeContextType = {
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

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
