const fs = require('fs');
let code = fs.readFileSync('src/lib/widget-plugins.ts', 'utf8');

code = code.replace(/_presetToTheme\(cyberpunkPreset\)/g, 'presetToThemeSettings(neuroklastClassicPreset)');

fs.writeFileSync('src/lib/widget-plugins.ts', code);
console.log('done');
