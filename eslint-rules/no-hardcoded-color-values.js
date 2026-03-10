/**
 * ESLint rule: no-hardcoded-color-values
 *
 * Prevents hardcoded Tailwind CSS palette colors in JSX className strings and
 * hex/rgb color values in inline style objects.
 *
 * Allowed: design tokens (bg-primary, text-foreground, bg-status-error, etc.)
 * Disallowed: bg-red-500, text-blue-300, border-green-400, #ff0000, rgb(255,0,0)
 *
 * This enforces the design token system defined in src/index.css and prevents
 * AI agents from bypassing the color system with hardcoded values.
 *
 * Exempt files: src/index.css, tailwind.config.*, *.test.*, src/_theme_inbox
 */

// Tailwind base palette color names (the ones with numeric shades like -500)
const TAILWIND_PALETTE_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink',
  'rose', 'slate', 'gray', 'zinc', 'neutral', 'stone',
]

const PALETTE_CLASS_RE = new RegExp(
  `\\b(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|caret|accent|decoration)-(?:${TAILWIND_PALETTE_COLORS.join('|')})-\\d{2,3}\\b`,
)

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/
const RGB_COLOR_RE = /\brgb[a]?\s*\(/i

const EXEMPT_PATHS = [
  'tailwind.config',
  'index.css',
  '.test.',
  '.spec.',
  '/test/',
  '_theme_inbox',
  'vite.config',
  'postcss.config',
]

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded Tailwind palette colors and hex/rgb values; use design tokens instead ' +
        '(bg-primary, text-foreground, bg-status-error, etc.)',
      url: 'https://github.com/Neuroklast/neuroklast-band-land/blob/main/src/index.css',
    },
    messages: {
      noTailwindPaletteColor:
        'Hardcoded Tailwind palette color "{{color}}" found. ' +
        'Use a design token instead (bg-primary, text-foreground, bg-status-error, etc.). ' +
        'See src/index.css for available tokens.',
      noHardcodedHex:
        'Hardcoded hex color "{{color}}" found in style prop. ' +
        'Use a CSS variable (var(--color-primary)) or a design token class instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (EXEMPT_PATHS.some(p => filename.includes(p))) return {}

    function checkStringForPaletteColors(value, node) {
      const match = PALETTE_CLASS_RE.exec(value)
      if (match) {
        context.report({
          node,
          messageId: 'noTailwindPaletteColor',
          data: { color: match[0] },
        })
      }
    }

    function checkStringForHexColors(value, node) {
      const match = HEX_COLOR_RE.exec(value)
      if (match) {
        context.report({
          node,
          messageId: 'noHardcodedHex',
          data: { color: match[0] },
        })
      }
      if (RGB_COLOR_RE.test(value)) {
        context.report({
          node,
          messageId: 'noHardcodedHex',
          data: { color: value.slice(0, 30) },
        })
      }
    }

    return {
      // Check JSX className strings for Tailwind palette colors
      JSXAttribute(node) {
        const name = node.name?.name
        if (name !== 'className') return

        const value = node.value
        if (!value) return

        // className="..."
        if (value.type === 'Literal' && typeof value.value === 'string') {
          checkStringForPaletteColors(value.value, node)
          return
        }

        // className={`...`} — template literal
        if (
          value.type === 'JSXExpressionContainer' &&
          value.expression?.type === 'TemplateLiteral'
        ) {
          for (const quasi of value.expression.quasis) {
            checkStringForPaletteColors(quasi.value.raw, node)
          }
          return
        }
      },

      // Check style={{ color: '#ff0000' }} objects for hex/rgb values
      Property(node) {
        if (node.value?.type !== 'Literal') return
        if (typeof node.value.value !== 'string') return

        // Only check inside JSX style objects (heuristic: parent is ObjectExpression inside JSXExpressionContainer)
        const value = node.value.value
        checkStringForHexColors(value, node)
      },
    }
  },
}
