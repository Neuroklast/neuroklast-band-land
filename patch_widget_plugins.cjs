const fs = require('fs');
let code = fs.readFileSync('src/lib/widget-plugins.ts', 'utf8');

code = code.replace(/import \{.*?\} from '\.\/design-presets'/s, `import { neuroklastClassicPreset } from './design-presets'`);
code = code.replace(/const presetSettings = presetToThemeSettings\(cyberpunkPreset\)/, `const presetSettings = presetToThemeSettings(neuroklastClassicPreset)`);

fs.writeFileSync('src/lib/widget-plugins.ts', code);
console.log('done');
