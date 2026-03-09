const fs = require('fs');
let code = fs.readFileSync('src/lib/widget-plugins.ts', 'utf8');

code = code.replace(/import \{ neuroklastClassicPreset \} from '\.\/design-presets'/, `import { neuroklastClassicPreset, presetToThemeSettings } from './design-presets'`);

fs.writeFileSync('src/lib/widget-plugins.ts', code);
console.log('done');
