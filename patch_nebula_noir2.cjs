const fs = require('fs');
let code = fs.readFileSync('src/themes/nebula-noir-theme/index.ts', 'utf8');

code = code.replace(/\/\/ colors: \{[\s\S]*?\},/g, '');
code = code.replace(/fonts: \{[\s\S]*?\},/g, '');
code = code.replace(/\/\/ effects: \{[\s\S]*?\},/g, '');
code = code.replace(/\/\/ metadata: \{[\s\S]*?\}/g, '');

fs.writeFileSync('src/themes/nebula-noir-theme/index.ts', code);
console.log('done');
