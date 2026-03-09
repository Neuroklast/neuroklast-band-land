const fs = require('fs');

let vk = fs.readFileSync('api/validate-key.ts', 'utf8');
vk = vk.replace(/\(req as any\)/g, '(req as Record<string, unknown>)');
fs.writeFileSync('api/validate-key.ts', vk);

let nnn = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
nnn = nnn.replace(/\{false && \([\s\S]*?\)\}/, '');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', nnn);

console.log('done');
