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
