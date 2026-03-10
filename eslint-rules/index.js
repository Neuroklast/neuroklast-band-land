/**
 * Custom ESLint plugin: @band-land/eslint-plugin
 *
 * Enforces architectural policies for the band-land project:
 * - no-direct-localstorage: All localStorage access must go through approved abstractions
 * - no-direct-theme-context: Theme state must be accessed via useThemeEngine() hook
 */

import noDirectLocalStorage from './no-direct-localstorage.js';
import noDirectThemeContext from './no-direct-theme-context.js';

export default {
  rules: {
    'no-direct-localstorage': noDirectLocalStorage,
    'no-direct-theme-context': noDirectThemeContext,
  },
};
