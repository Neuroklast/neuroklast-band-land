const fs = require('fs');
let code = fs.readFileSync('src/themes/zardonic/index.ts', 'utf8');

code = code.replace(/body: "'Share Tech Mono', monospace",\n    \n  borderRadius: 0,/, `body: "'Share Tech Mono', monospace",\n    mono: "'Share Tech Mono', monospace",\n  },\n  borderRadius: 0,`);

fs.writeFileSync('src/themes/zardonic/index.ts', code);
console.log('done');
