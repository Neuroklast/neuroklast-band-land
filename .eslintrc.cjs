module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'band-land', 'i18next'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    'band-land/no-hardcoded-color-values': 'warn',
    'no-restricted-syntax': [
      'error',
      {
        selector: "TSAsExpression > TSAsExpression",
        message: 'Double type-cast "as unknown as" is banned. If TypeScript complains, fix the architecture — do not suppress the type error',
      }
    ],
    'i18next/no-literal-string': ['warn', {
      markupOnly: true,
      ignoreAttribute: ['className', 'id', 'name', 'type', 'htmlFor', 'd', 'viewBox', 'xmlns', 'cx', 'cy', 'r', 'fill', 'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'target', 'rel', 'style', 'aria-label', 'role', 'aria-hidden', 'aria-expanded', 'aria-controls', 'data-state', 'data-theme'],
      ignore: ['^[A-Z_\\W0-9]+$']
    }]
  },
}
