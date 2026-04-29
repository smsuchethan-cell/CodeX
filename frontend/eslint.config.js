import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Downgrade from error → warn: project uses `any` in several places
      // for API response arrays. TypeScript strict mode still catches real issues.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Leaflet/GeoJSON types use {} as a generic bound — treat as warning only
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Some variables are declared for future use — keep as warning
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'off', // handled by typescript-eslint version above
    },
  },
])

