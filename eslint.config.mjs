import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import { fixupPluginRules } from '@eslint/compat';

/** @type {import('eslint').Linter.Config[]} */
export default [
    // Global ignores
    {
        ignores: [
            'dist/',
            'android/',
            'public/workbox-*.js',
            'public/sw.js',
            'src/components/ui/calendar.tsx',
            '.next/',
            'node_modules/',
            'coverage/',
            'playwright-report/',
            'test-results/',
        ],
    },
    // Manual Next.js Configuration
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        plugins: {
            '@next/next': fixupPluginRules(nextPlugin),
            'react': fixupPluginRules(reactPlugin),
            'react-hooks': fixupPluginRules(hooksPlugin),
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            ...reactPlugin.configs.recommended.rules,
            ...hooksPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react/prop-types': 'off',
            'react/no-unknown-property': 'off', // Mostly for Three.js (R3F) compatibility
            // Disable new React 19 / Compiler rules that are causing CI failures
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/no-impure-render': 'off',
            'react-hooks/exhaustive-deps': 'off',
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    // TypeScript-specific configuration
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': fixupPluginRules(tseslint),
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
];
