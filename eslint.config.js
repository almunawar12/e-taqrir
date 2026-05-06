import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
    { ignores: ['public/**', 'vendor/**', 'storage/**', 'bootstrap/cache/**', 'node_modules/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['resources/js/**/*.{ts,tsx,js,jsx}'],
        plugins: { react, 'react-hooks': reactHooks },
        languageOptions: {
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: { window: 'readonly', document: 'readonly', route: 'readonly' },
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
    prettier,
];
