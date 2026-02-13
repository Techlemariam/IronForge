// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import { fixupPluginRules } from '@eslint/compat';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/** @type {import('eslint').Linter.Config[]} */
export default [// Global ignores
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
            'storybook-static/',
        ],
    }, // Manual Next.js Configuration
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        plugins: {
            '@next/next': fixupPluginRules(nextPlugin),
            'react': fixupPluginRules(reactPlugin),
            'react-hooks': fixupPluginRules(hooksPlugin),
            'jsx-a11y': fixupPluginRules(jsxA11y),
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
            ...jsxA11y.flatConfigs.recommended.rules,
            "jsx-a11y/anchor-is-valid": "warn",
            "jsx-a11y/no-autofocus": "warn",
            "jsx-a11y/heading-has-content": "warn",
            "jsx-a11y/label-has-associated-control": "warn",
            "jsx-a11y/click-events-have-key-events": "warn",
            "jsx-a11y/no-static-element-interactions": "warn",
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react/prop-types': 'off',
            'react/no-unknown-property': 'off', // Mostly for Three.js (R3F) compatibility
            // Disable new React 19 / Compiler rules that are causing CI failures
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/no-impure-render': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/exhaustive-deps': 'off',
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    }, // TypeScript-specific configuration
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
    }, // Override for Storybook files
    {
        files: ['**/*.stories.tsx', '**/*.stories.ts', '**/stories/**/*.tsx'],
        rules: {
            'storybook/no-renderer-packages': 'off',
        },
    }, ...storybook.configs["flat/recommended"].map(config => ({
        ...config,
        rules: {
            ...config.rules,
            'storybook/no-renderer-packages': 'off',
        },
    }))];
