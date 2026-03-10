/**
 * ESLint rule: no-direct-localstorage
 *
 * Disallows direct localStorage access outside of approved abstraction files.
 * All localStorage operations should go through useKV, useThemeEngine, useLocale,
 * or other approved hooks/wrappers.
 */

const APPROVED_FILES = [
  'use-kv.ts',
  'ThemeContext.tsx',
  'LocaleContext.tsx',
  'use-activation-key.ts',
  'use-sound.ts',
  'analytics.ts',
  'CookieBanner.tsx',
  'ThemeCustomizerDialog.tsx',
  'StatsDashboard.tsx',
];

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct localStorage access outside approved abstraction files',
    },
    messages: {
      noDirectLocalStorage:
        'Direct localStorage access is not allowed. Use useKV(), useThemeEngine(), or useLocale() instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedFiles: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const allowedFiles = options.allowedFiles || APPROVED_FILES;

    const filename = context.filename || context.getFilename();
    const basename = filename.split('/').pop();

    if (allowedFiles.some((f) => basename === f || filename.endsWith(f))) {
      return {};
    }

    // Also skip test files
    if (filename.includes('.test.') || filename.includes('.spec.') || filename.includes('/test/')) {
      return {};
    }

    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'localStorage'
        ) {
          context.report({ node, messageId: 'noDirectLocalStorage' });
        }
      },
      // Also catch window.localStorage
      'MemberExpression > MemberExpression'(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'window' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'localStorage'
        ) {
          context.report({ node, messageId: 'noDirectLocalStorage' });
        }
      },
    };
  },
};
