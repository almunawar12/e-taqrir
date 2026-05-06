import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#006948',
                'primary-dark': '#004d35',
                'primary-container': '#00855d',
                'primary-fixed': '#85f8c4',
                'on-primary': '#ffffff',
                'on-primary-container': '#f5fff7',
                surface: '#f5fbf5',
                'surface-bright': '#f5fbf5',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#eff5ef',
                'surface-container': '#e9efe9',
                'surface-container-high': '#e4eae4',
                'surface-container-highest': '#dee4de',
                'surface-dim': '#d5dcd6',
                'on-surface': '#171d19',
                'on-surface-variant': '#3d4a42',
                'inverse-surface': '#2c322e',
                'inverse-on-surface': '#ecf2ec',
                background: '#f5fbf5',
                'on-background': '#171d19',
                outline: '#6d7a72',
                'outline-variant': '#bccac0',
                secondary: '#5c5f60',
                'on-secondary': '#ffffff',
                'secondary-container': '#e1e3e4',
                'on-secondary-container': '#626566',
                tertiary: '#585c62',
                'on-tertiary': '#ffffff',
                error: '#ba1a1a',
                'on-error': '#ffffff',
                'error-container': '#ffdad6',
                'on-error-container': '#93000a',
            },
            borderRadius: {
                DEFAULT: '0.125rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            },
            spacing: {
                xs:  '4px',
                sm:  '8px',
                md:  '16px',
                lg:  '24px',
                xl:  '40px',
                'sidebar-width':    '260px',
                'container-max':    '1280px',
            },
            fontSize: {
                'body-sm':    ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'body-md':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'body-lg':    ['18px', { lineHeight: '28px', fontWeight: '400' }],
                'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
                'button':     ['14px', { lineHeight: '20px', fontWeight: '500' }],
                'h1':         ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
                'h2':         ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
                'h3':         ['20px', { lineHeight: '28px', fontWeight: '600' }],
            },
        },
    },

    plugins: [forms],
};
