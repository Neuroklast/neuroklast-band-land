const fs = require('fs');
let code = fs.readFileSync('src/themes/glitch-noir/index.ts', 'utf8');
code = code.replace(/primary: 'oklch\(0\.95 0 0\)',[\s\S]*?'muted-foreground': 'oklch\(0\.6 0 0\)'\n  },/g, '');
fs.writeFileSync('src/themes/glitch-noir/index.ts', code);
console.log('done');
