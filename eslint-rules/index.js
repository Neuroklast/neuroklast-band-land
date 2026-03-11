/**
 * Custom ESLint plugin: @band-land/eslint-plugin
 *
 * Enforces architectural policies for the band-land project:
 * - no-direct-localstorage:     All localStorage access must go through approved abstractions
 * - no-direct-theme-context:    Theme state must be accessed via useThemeEngine() hook
 * - require-dialog-props:       All *Dialog.tsx / *Window.tsx must implement DialogProps
 *                               (open: boolean + onClose/onOpenChange)
 * - no-hardcoded-color-values:  No Tailwind palette colors (bg-red-500) or hex values in JSX;
 *                               use design tokens (bg-primary, text-foreground, etc.)
 */

import noDirectLocalStorage from './no-direct-localstorage.js';
import noDirectThemeContext from './no-direct-theme-context.js';
import requireDialogProps from './require-dialog-props.js';
import noHardcodedColorValues from './no-hardcoded-color-values.js';

export default {
  rules: {
    'no-direct-localstorage': noDirectLocalStorage,
    'no-direct-theme-context': noDirectThemeContext,
    'require-dialog-props': requireDialogProps,
    'no-hardcoded-color-values': noHardcodedColorValues,
  },
};
