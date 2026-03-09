const fs = require('fs');
let code = fs.readFileSync('src/lib/theme-registry.ts', 'utf8');

// Replace the re-export line
code = code.replace(/export \{ cyberpunkTheme[\s\S]*?\} \n/s, `export { neuroklastClassicTheme } \n`);
fs.writeFileSync('src/lib/theme-registry.ts', code);
console.log('done');
