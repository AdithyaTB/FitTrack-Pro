import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference
    const getInitialTheme = () => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedPrefs = window.localStorage.getItem('theme');
            if (typeof storedPrefs === 'string') {
                return storedPrefs;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'dark'; // Default to dark for this app vibe
    };

    const [theme, setTheme] = useState(getInitialTheme);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        window.localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        const root = window.document.documentElement;
        // Basic implementation: remove dark/light classes then add the new one
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
