import React, { useEffect } from 'react';
import useThemeStore from '../store/themeStore';

const ThemeProvider = ({ children }) => {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        // Detect system preference on first load
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('lumini-theme');

        if (!savedTheme && prefersDark) {
            useThemeStore.getState().setTheme('dark');
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const savedTheme = localStorage.getItem('lumini-theme');
            if (!savedTheme) {
                useThemeStore.getState().setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return <>{children}</>;
};

export default ThemeProvider;
