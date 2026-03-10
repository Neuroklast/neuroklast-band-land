/**
 * ESLint rule: require-dialog-props
 *
 * Enforces that all dialog and window component files (*Dialog.tsx, *Window.tsx)
 * declare `open: boolean` AND at least one of `onClose` / `onOpenChange` in their
 * Props interface.
 *
 * Two valid patterns are supported:
 *   Pattern A — DialogProps (preferred for most dialogs):
 *     open: boolean
 *     onClose: () => void
 *
 *   Pattern B — Radix/shadcn style (acceptable for component-library dialogs):
 *     open: boolean
 *     onOpenChange: (open: boolean) => void
 *
 * This prevents AI agents from shipping dialogs without proper open/close handling.
 */

const DIALOG_FILE_RE = /(Dialog|Window)\.(tsx|ts)$/

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that dialog/window components declare `open: boolean` and `onClose` or `onOpenChange` ' +
        '(DialogProps contract from @/lib/component-contracts)',
      url: 'https://github.com/Neuroklast/neuroklast-band-land/blob/main/src/lib/component-contracts.ts',
    },
    messages: {
      missingOpen:
        'Dialog component Props must include "open: boolean". ' +
        'Extend DialogProps from @/lib/component-contracts.',
      missingCloseHandler:
        'Dialog component Props must include "onClose" or "onOpenChange". ' +
        'Extend DialogProps from @/lib/component-contracts.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()

    if (!DIALOG_FILE_RE.test(filename)) return {}

    // Skip test files — they often define partial props for mocking
    if (filename.includes('.test.') || filename.includes('.spec.') || filename.includes('/test/')) {
      return {}
    }

    let hasOpen = false
    let hasOnClose = false
    let hasOnOpenChange = false

    return {
      TSPropertySignature(node) {
        const key = node.key
        if (key.type !== 'Identifier') return
        if (key.name === 'open')         hasOpen = true
        if (key.name === 'onClose')      hasOnClose = true
        if (key.name === 'onOpenChange') hasOnOpenChange = true
      },

      'Program:exit'() {
        if (!hasOpen) {
          context.report({ loc: { line: 1, column: 0 }, messageId: 'missingOpen' })
        }
        if (!hasOnClose && !hasOnOpenChange) {
          context.report({ loc: { line: 1, column: 0 }, messageId: 'missingCloseHandler' })
        }
      },
    }
  },
}
