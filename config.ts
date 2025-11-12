// config.ts

// This file centralizes all configurable parts of the application.
// It's designed to read from environment variables (process.env)
// to allow for easy customization of the app's appearance and text.
// Default values are provided for a seamless out-of-the-box experience.

const getEnv = (key: string, defaultValue: string): string => {
    // In a real build environment, 'process.env' would be populated.
    // Here, we provide a robust fallback to the defaultValue.
    return (typeof process !== 'undefined' && process.env?.[key]) || defaultValue;
};

export const config = {
    // App Information
    APP_NAME: getEnv('REACT_APP_NAME', 'ReactAI'),
    WELCOME_TITLE: getEnv('REACT_APP_WELCOME_TITLE', "Hello, I'm ReactAI"),
    WELCOME_SUBTITLE: getEnv('REACT_APP_WELCOME_SUBTITLE', 'What can I help with?'),
    
    // Font Configuration
    FONT_FAMILY: getEnv('REACT_APP_FONT_FAMILY', 'Outfit'),
    FONT_URL: getEnv('REACT_APP_FONT_URL', 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap'),

    // Color Palette
    // All colors can be overridden by environment variables.
    // e.g., REACT_APP_LIGHT_BG, REACT_APP_DARK_TEXT_PRIMARY, REACT_APP_ACCENT_START
    colors: {
        light: {
            bg: getEnv('REACT_APP_LIGHT_BG', '#f0f2f5'),
            surface: getEnv('REACT_APP_LIGHT_SURFACE', 'rgba(255, 255, 255, 0.4)'),
            textPrimary: getEnv('REACT_APP_LIGHT_TEXT_PRIMARY', '#1c1c1e'),
            textSecondary: getEnv('REACT_APP_LIGHT_TEXT_SECONDARY', '#6b7280'),
            shadow: getEnv('REACT_APP_LIGHT_SHADOW', 'rgba(0, 0, 0, 0.1)'),
            highlight: getEnv('REACT_APP_LIGHT_HIGHLIGHT', 'rgba(255, 255, 255, 0.6)'),
        },
        dark: {
            bg: getEnv('REACT_APP_DARK_BG', '#0f172a'),
            surface: getEnv('REACT_APP_DARK_SURFACE', 'rgba(30, 41, 59, 0.4)'),
            textPrimary: getEnv('REACT_APP_DARK_TEXT_PRIMARY', '#f8fafc'),
            textSecondary: getEnv('REACT_APP_DARK_TEXT_SECONDARY', '#94a3b8'),
            shadow: getEnv('REACT_APP_DARK_SHADOW', 'rgba(0, 0, 0, 0.5)'),
            highlight: getEnv('REACT_APP_DARK_HIGHLIGHT', 'rgba(255, 255, 255, 0.05)'),
        },
        accent: {
            start: getEnv('REACT_APP_ACCENT_START', '#7e3ff2'),
            end: getEnv('REACT_APP_ACCENT_END', '#03dac5'),
        }
    }
};
