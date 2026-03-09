const fs = require('fs');
let code = fs.readFileSync('src/lib/theme-registry.ts', 'utf8');

const newCode = code.replace(/import {.*?} from '\.\/design-presets'/s, `import {
  presetToThemeSettings,
  neuroklastClassicPreset,
} from './design-presets'`);

const newCode2 = newCode.replace(/export const THEME_CATALOG: ThemeDefinition\[] = \[.*?\]/s, `export const THEME_CATALOG: ThemeDefinition[] = [
  {
    id: 'neuroklast-classic',
    name: 'Neuroklast Classic',
    description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents and code-rain loading',
    licenseStatus: 'free',
    theme: {
      ...presetToThemeSettings(neuroklastClassicPreset),
      // Structural layout defaults for this theme engine (not part of the color preset)
      heroStyle: 'chromatic-hover',
      loadingScreenType: 'code-rain',
    },
    author: 'Neuroklast',
    tags: ['dark', 'cyber', 'industrial'],
    themeType: 'full',
  },
]`);

// also fix the export { ... } from '@/themes'
const finalCode = newCode2.replace(/export \{[\s\S]*?\} from '\.\/themes'/s, `export { neuroklastClassicTheme } from './themes'`);

fs.writeFileSync('src/lib/theme-registry.ts', finalCode);
console.log('done');
