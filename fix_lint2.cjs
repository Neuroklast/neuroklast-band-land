const fs = require('fs');

let vk = fs.readFileSync('api/validate-key.ts', 'utf8');
vk = vk.replace(/data: any/g, 'data: Record<string, unknown>');
fs.writeFileSync('api/validate-key.ts', vk);

let ahd = fs.readFileSync('src/features/admin/components/AdminHubDialog.tsx', 'utf8');
ahd = ahd.replace(/icon: any/g, 'icon: React.ElementType');
fs.writeFileSync('src/features/admin/components/AdminHubDialog.tsx', ahd);

let nnn = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
nnn = nnn.replace(/\{0 > 0 && \(/g, '{false && (');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', nnn);

console.log('done');
