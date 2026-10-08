import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['dist', 'backend']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs.flat.recommended,
        ],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            'react-hooks/preserve-manual-memoization': 'warn',
        },
    },
    {
        // swagger-client has no types, so the API client works with `any`
        files: ['src/controller/APIClient.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
        },
    },
]);
