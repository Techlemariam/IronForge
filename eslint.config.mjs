import { FlatCompat } from '@eslint/eslintrc';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

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
    // Extend Next.js config using FlatCompat
    ...compat.extends('next/core-web-vitals'),
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
            '@typescript-eslint': tseslint,
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
