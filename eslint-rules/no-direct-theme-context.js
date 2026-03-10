/**
 * ESLint rule: no-direct-theme-context
 *
 * Disallows direct useContext(ThemeContext) access outside ThemeContext.tsx.
 * All theme state access should go through the useThemeEngine() hook.
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct useContext(ThemeContext) access outside of ThemeContext.tsx',
    },
    messages: {
      noDirectThemeContext:
        'Direct useContext(ThemeContext) is not allowed. Use the useThemeEngine() hook instead.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const basename = filename.split('/').pop();

    if (basename === 'ThemeContext.tsx') {
      return {};
    }

    // Skip test files
    if (filename.includes('.test.') || filename.includes('.spec.') || filename.includes('/test/')) {
      return {};
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useContext' &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Identifier' &&
          node.arguments[0].name === 'ThemeContext'
        ) {
          context.report({ node, messageId: 'noDirectThemeContext' });
        }
      },
    };
  },
};
