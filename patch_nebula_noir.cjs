const fs = require('fs');
let code = fs.readFileSync('src/themes/nebula-noir-theme/index.ts', 'utf8');

code = code.replace(/export const sparkTheme = \{/g, `import type { ThemePackage } from '@/lib/types'

export const nebulaNoirTheme: ThemePackage = {`);

code = code.replace(/id: 'nebula-noir-theme',/, `id: 'nebula-noir-theme',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Cinzel', serif",
    body: "'Montserrat', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },`);

code = code.replace(/export default sparkTheme/g, 'export default nebulaNoirTheme');
fs.writeFileSync('src/themes/nebula-noir-theme/index.ts', code);
console.log('done');
