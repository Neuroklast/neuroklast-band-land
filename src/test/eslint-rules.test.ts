// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
import noDirectLocalStorage from '../../eslint-rules/no-direct-localstorage.js';
import noDirectThemeContext from '../../eslint-rules/no-direct-theme-context.js';

function createLinter() {
  const linter = new Linter();
  return linter;
}

const lintConfig = {
  localStorage: {
    plugins: { 'band-land': { rules: { 'no-direct-localstorage': noDirectLocalStorage } } },
    rules: { 'band-land/no-direct-localstorage': 'error' as const },
    languageOptions: { ecmaVersion: 2020 as const, sourceType: 'module' as const },
  },
  themeContext: {
    plugins: { 'band-land': { rules: { 'no-direct-theme-context': noDirectThemeContext } } },
    rules: { 'band-land/no-direct-theme-context': 'error' as const },
    languageOptions: { ecmaVersion: 2020 as const, sourceType: 'module' as const },
  },
};

describe('ESLint rule: no-direct-localstorage', () => {
  it('reports errors for direct localStorage.getItem', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'const x = localStorage.getItem("foo");',
      lintConfig.localStorage,
      { filename: 'MyComponent.js' },
    );
    expect(messages.some((m) => m.ruleId === 'band-land/no-direct-localstorage')).toBe(true);
  });

  it('reports errors for direct localStorage.setItem', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.setItem("foo", "bar");',
      lintConfig.localStorage,
      { filename: 'MyComponent.js' },
    );
    expect(messages.some((m) => m.ruleId === 'band-land/no-direct-localstorage')).toBe(true);
  });

  it('reports errors for direct localStorage.removeItem', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.removeItem("foo");',
      lintConfig.localStorage,
      { filename: 'MyComponent.js' },
    );
    expect(messages.some((m) => m.ruleId === 'band-land/no-direct-localstorage')).toBe(true);
  });

  it('allows localStorage in use-kv.ts', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'const x = localStorage.getItem("foo");',
      lintConfig.localStorage,
      { filename: 'use-kv.ts' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-localstorage')).toHaveLength(0);
  });

  it('allows localStorage in ThemeContext.tsx', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.setItem("foo", "bar");',
      lintConfig.localStorage,
      { filename: 'ThemeContext.tsx' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-localstorage')).toHaveLength(0);
  });

  it('allows localStorage in LocaleContext.tsx', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.setItem("foo", "bar");',
      lintConfig.localStorage,
      { filename: 'LocaleContext.tsx' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-localstorage')).toHaveLength(0);
  });

  it('allows localStorage in use-activation-key.ts', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.setItem("foo", "bar");',
      lintConfig.localStorage,
      { filename: 'use-activation-key.ts' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-localstorage')).toHaveLength(0);
  });

  it('allows localStorage in test files', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.clear();',
      lintConfig.localStorage,
      { filename: 'use-kv.test.js' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-localstorage')).toHaveLength(0);
  });

  it('supports custom allowedFiles option', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'localStorage.setItem("foo", "bar");',
      {
        plugins: { 'band-land': { rules: { 'no-direct-localstorage': noDirectLocalStorage } } },
        rules: { 'band-land/no-direct-localstorage': ['error', { allowedFiles: ['my-storage.js'] }] },
        languageOptions: { ecmaVersion: 2020 as const, sourceType: 'module' as const },
      },
      { filename: 'my-storage.js' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-localstorage')).toHaveLength(0);
  });
});

describe('ESLint rule: no-direct-theme-context', () => {
  it('reports errors for direct useContext(ThemeContext)', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'const theme = useContext(ThemeContext);',
      lintConfig.themeContext,
      { filename: 'MyComponent.js' },
    );
    expect(messages.some((m) => m.ruleId === 'band-land/no-direct-theme-context')).toBe(true);
  });

  it('allows useContext(ThemeContext) in ThemeContext.tsx', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'const theme = useContext(ThemeContext);',
      lintConfig.themeContext,
      { filename: 'ThemeContext.tsx' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-theme-context')).toHaveLength(0);
  });

  it('allows useContext(ThemeContext) in test files', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'const theme = useContext(ThemeContext);',
      lintConfig.themeContext,
      { filename: 'theme-engine.test.js' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-theme-context')).toHaveLength(0);
  });

  it('allows useContext with other contexts', () => {
    const linter = createLinter();
    const messages = linter.verify(
      'const locale = useContext(LocaleContext);',
      lintConfig.themeContext,
      { filename: 'MyComponent.js' },
    );
    expect(messages.filter((m) => m.ruleId === 'band-land/no-direct-theme-context')).toHaveLength(0);
  });
});

// ─── New rule tests ────────────────────────────────────────────────────────────

import requireDialogProps from '../../eslint-rules/require-dialog-props.js';
import noHardcodedColorValues from '../../eslint-rules/no-hardcoded-color-values.js';

// ESLint v9 flat config arrays — required for .tsx/.ts/.jsx files
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require('@typescript-eslint/parser')

const lintConfigExtra = {
  // require-dialog-props: uses TSPropertySignature — needs TS parser for full coverage.
  // Unit tests here only cover file-level exemptions (non-dialog / test files).
  // Full TypeScript dialog compliance is verified in architecture.test.ts.
  dialogProps: [{
    files: ['**/*.{ts,tsx,js}'],
    plugins: { 'band-land': { rules: { 'require-dialog-props': requireDialogProps } } },
    rules: { 'band-land/require-dialog-props': 'warn' as const },
    languageOptions: { ecmaVersion: 2020 as const, sourceType: 'module' as const },
  }],
  // no-hardcoded-color-values: needs @typescript-eslint/parser for JSX support in ESLint v9
  // (ecmaFeatures.jsx was removed in v9 flat config; parser handles JSX instead)
  hardcodedColors: [{
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: { 'band-land': { rules: { 'no-hardcoded-color-values': noHardcodedColorValues } } },
    rules: { 'band-land/no-hardcoded-color-values': 'warn' as const },
    languageOptions: {
      ecmaVersion: 2020 as const,
      sourceType: 'module' as const,
      parser: tsParser,
    },
  }],
};

describe('ESLint rule: require-dialog-props', () => {
  // Note: TSPropertySignature detection requires the TypeScript parser which is wired up
  // in the full ESLint pipeline. These unit tests cover the file-type exemptions only.
  // Full dialog contract compliance (with TS parser) is verified in architecture.test.ts.

  it('does not warn for non-dialog files', () => {
    const linter = createLinter();
    // No TSPropertySignature — rule should never fire on non-dialog files
    const code = `var x = 1;`;
    const messages = linter.verify(code, lintConfigExtra.dialogProps, { filename: 'MyComponent.tsx' });
    expect(messages.filter((m) => m.ruleId === 'band-land/require-dialog-props')).toHaveLength(0);
  });

  it('does not warn for test files (even named *Dialog.test.tsx)', () => {
    const linter = createLinter();
    const code = `var x = 1;`;
    const messages = linter.verify(code, lintConfigExtra.dialogProps, { filename: 'MyDialog.test.tsx' });
    expect(messages.filter((m) => m.ruleId === 'band-land/require-dialog-props')).toHaveLength(0);
  });

  it('does not warn for spec files', () => {
    const linter = createLinter();
    const code = `var x = 1;`;
    const messages = linter.verify(code, lintConfigExtra.dialogProps, { filename: 'MyDialog.spec.tsx' });
    expect(messages.filter((m) => m.ruleId === 'band-land/require-dialog-props')).toHaveLength(0);
  });

  it('reports warnings for Dialog files lacking open/onClose (no TSPropertySignature at all)', () => {
    const linter = createLinter();
    // Plain JS — no TSPropertySignature nodes, so hasOpen and hasOnClose stay false
    const code = `var x = 1;`;
    const messages = linter.verify(code, lintConfigExtra.dialogProps, { filename: 'MyDialog.tsx' });
    // Both missingOpen and missingCloseHandler should fire
    expect(messages.filter((m) => m.ruleId === 'band-land/require-dialog-props')).toHaveLength(2);
  });
});

describe('ESLint rule: no-hardcoded-color-values', () => {
  it('warns on Tailwind palette color in className', () => {
    const linter = createLinter();
    const code = `function C() { return <div className="bg-red-500 text-white" /> }`;
    const messages = linter.verify(code, lintConfigExtra.hardcodedColors, { filename: 'Comp.tsx' });
    expect(messages.some((m) => m.ruleId === 'band-land/no-hardcoded-color-values')).toBe(true);
  });

  it('warns on hex color in style prop', () => {
    const linter = createLinter();
    const code = `function C() { return <div style={{ color: '#ff0000' }} /> }`;
    const messages = linter.verify(code, lintConfigExtra.hardcodedColors, { filename: 'Comp.tsx' });
    expect(messages.some((m) => m.ruleId === 'band-land/no-hardcoded-color-values')).toBe(true);
  });

  it('does not warn on design token classes', () => {
    const linter = createLinter();
    const code = `function C() { return <div className="bg-primary text-foreground border-border" /> }`;
    const messages = linter.verify(code, lintConfigExtra.hardcodedColors, { filename: 'Comp.tsx' });
    expect(messages.filter((m) => m.ruleId === 'band-land/no-hardcoded-color-values')).toHaveLength(0);
  });

  it('does not warn in index.css', () => {
    const linter = createLinter();
    const code = `const x = 'bg-red-500';`;
    const messages = linter.verify(code, lintConfigExtra.hardcodedColors, { filename: 'index.css' });
    expect(messages.filter((m) => m.ruleId === 'band-land/no-hardcoded-color-values')).toHaveLength(0);
  });

  it('does not warn in test files', () => {
    const linter = createLinter();
    const code = `function C() { return <div className="bg-red-500" /> }`;
    const messages = linter.verify(code, lintConfigExtra.hardcodedColors, { filename: 'Comp.test.tsx' });
    expect(messages.filter((m) => m.ruleId === 'band-land/no-hardcoded-color-values')).toHaveLength(0);
  });
});
