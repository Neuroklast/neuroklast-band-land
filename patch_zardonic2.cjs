const fs = require('fs');
let code = fs.readFileSync('src/themes/zardonic/index.ts', 'utf8');

code = code.replace(/\/\/ colors: \{[\s\S]*?\},/g, '');
code = code.replace(/\/\/ fonts: \{[\s\S]*?\},/g, '');

fs.writeFileSync('src/themes/zardonic/index.ts', code);
console.log('done');
