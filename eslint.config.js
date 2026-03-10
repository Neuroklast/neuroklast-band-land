import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import i18next from 'eslint-plugin-i18next'
import bandLandPlugin from './eslint-rules/index.js'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'eslint-rules', 'src/_theme_inbox'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'i18next': i18next,
      'band-land': bandLandPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'i18next/no-literal-string': [
        'warn',
        {
          markupOnly: true,
          ignoreAttribute: ['data-testid', 'className', 'id', 'key', 'htmlFor', 'type', 'name', 'value', 'style'],
        },
      ],
      'band-land/no-direct-localstorage': 'error',
      'band-land/no-direct-theme-context': 'error',
      'band-land/require-dialog-props': 'warn',
      'band-land/no-hardcoded-color-values': 'warn',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSAsExpression',
          message:
            'Double type-cast "as unknown as" is banned. If TypeScript complains, fix the architecture — do not suppress the type error.',
        },
        {
          // warn-level: CustomEvent is allowed in theme-engine internals (neuroklast_theme_config_update)
          // but must never be used for React component state propagation.
          selector: "NewExpression[callee.name='CustomEvent']",
          message:
            'new CustomEvent() must not be used for React component communication. Use props, context, or TanStack Query instead.',
        },
      ],
    },
  },
)
