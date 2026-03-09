const fs = require('fs');
let code = fs.readFileSync('src/themes/glitch-noir/index.ts', 'utf8');

code = code.replace(/export const glitchNoirTheme = \{/g, `import type { ThemePackage } from '@/lib/types'

export const glitchNoirTheme: ThemePackage = {
  description: 'A minimal dark techno theme',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Inter', serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },`);

fs.writeFileSync('src/themes/glitch-noir/index.ts', code);
console.log('done');
