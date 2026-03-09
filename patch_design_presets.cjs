const fs = require('fs');
let code = fs.readFileSync('src/lib/design-presets.ts', 'utf8');

// The file has a double declaration of neuroklastClassicPreset. Let's fix that.
code = code.replace(/export \{ neuroklastClassicPreset \}\n\n/g, '');

fs.writeFileSync('src/lib/design-presets.ts', code);
console.log('done');
