const fs = require('fs');

let code = fs.readFileSync('src/test/activation-license.test.ts', 'utf8');
code = code.replace(/vi\.stubEnv\('VITE_ACTIVATION_KEY', ''\)/, "vi.stubEnv('VITE_ACTIVATION_KEY', ''); vi.stubEnv('VITE_IS_PRIMARY', 'false')");
fs.writeFileSync('src/test/activation-license.test.ts', code);

console.log('done');
