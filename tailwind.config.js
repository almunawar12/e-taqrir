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
                // Primary
                primary:                       '#004532',
                'on-primary':                  '#ffffff',
                'primary-container':           '#065f46',
                'on-primary-container':        '#8bd6b7',
                'primary-fixed':               '#a6f2d1',
                'primary-fixed-dim':           '#8bd6b6',
                'on-primary-fixed':            '#002116',
                'on-primary-fixed-variant':    '#00513b',
                'inverse-primary':             '#8bd6b6',
                'surface-tint':                '#1b6b51',

                // Secondary
                secondary:                     '#006c49',
                'on-secondary':                '#ffffff',
                'secondary-container':         '#6cf8bb',
                'on-secondary-container':      '#00714d',
                'secondary-fixed':             '#6ffbbe',
                'secondary-fixed-dim':         '#4edea3',
                'on-secondary-fixed':          '#002113',
                'on-secondary-fixed-variant':  '#005236',

                // Tertiary
                tertiary:                      '#652925',
                'on-tertiary':                 '#ffffff',
                'tertiary-container':          '#823f3a',
                'on-tertiary-container':       '#ffb4ad',
                'tertiary-fixed':              '#ffdad6',
                'tertiary-fixed-dim':          '#ffb3ac',
                'on-tertiary-fixed':           '#3b0908',
                'on-tertiary-fixed-variant':   '#73332f',

                // Surface
                background:                    '#f7faf6',
                surface:                       '#f7faf6',
                'surface-bright':              '#f7faf6',
                'surface-dim':                 '#d8dbd7',
                'surface-container-lowest':    '#ffffff',
                'surface-container-low':       '#f1f4f0',
                'surface-container':           '#ecefeb',
                'surface-container-high':      '#e6e9e5',
                'surface-container-highest':   '#e0e3df',
                'surface-variant':             '#e0e3df',
                'on-surface':                  '#181c1a',
                'on-surface-variant':          '#3f4944',
                'on-background':               '#181c1a',
                'inverse-surface':             '#2d312f',
                'inverse-on-surface':          '#eef2ed',

                // Outline
                outline:                       '#6f7973',
                'outline-variant':             '#bec9c2',

                // Error
                error:                         '#ba1a1a',
                'on-error':                    '#ffffff',
                'error-container':             '#ffdad6',
                'on-error-container':          '#93000a',
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg:   '0.5rem',
                xl:   '0.75rem',
                full: '9999px',
            },
            spacing: {
                'container-padding': '2rem',
                'card-gap':          '1.5rem',
                gutter:              '1rem',
                'section-margin':    '2.5rem',
                'sidebar-width':     '280px',
            },
            fontSize: {
                'label-caps':  ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
                'body-sm':     ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'body-base':   ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
                'data-point':  ['24px', { lineHeight: '32px', fontWeight: '700' }],
                'display-lg':  ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
            },
        },
    },

    plugins: [forms],
};
