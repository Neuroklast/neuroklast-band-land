const fs = require('fs');
let code = fs.readFileSync('src/themes/zardonic/index.ts', 'utf8');

code = code.replace(/export const zardonicTheme = \{/g, `import type { ThemePackage } from '@/lib/types'

export const zardonicTheme: ThemePackage = {
  description: 'Zardonic industrial dark cyberpunk theme',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Orbitron', sans-serif",
    body: "'Share Tech Mono', monospace",
    mono: "'Share Tech Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },`);

fs.writeFileSync('src/themes/zardonic/index.ts', code);
console.log('done');
