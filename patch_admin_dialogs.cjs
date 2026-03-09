const fs = require('fs');

let adm = fs.readFileSync('src/components/AdminDialogManager.tsx', 'utf8');
adm = adm.replace(/const ContentView \= lazy\(\(\) \=\> import\('\@\/features\/admin\/components\/ContentView'\)\)\n/g, '');
adm = adm.replace(/\{activeDialog === 'content' && \([\s\S]*?onUpdateSiteConfig\)\}\n            \/\>\n          \)\}/g, '');
fs.writeFileSync('src/components/AdminDialogManager.tsx', adm);

let ahd = fs.readFileSync('src/features/admin/components/AdminHubDialog.tsx', 'utf8');
ahd = ahd.replace(/\{ item \}\: \{ item\: \{ label\: string\; icon\: React\.ElementType\; action\?\: \(\) \=\> void\; description\?\: string\; disabled\?\: boolean\; \} \}/g, '{ item }: { item: any }');
fs.writeFileSync('src/features/admin/components/AdminHubDialog.tsx', ahd);

let cf = fs.readFileSync('src/features/admin/components/ContentForms.tsx', 'utf8');
cf = cf.replace(/any/g, 'any'); // Keep the original anys where unknown breaks typing.
fs.writeFileSync('src/features/admin/components/ContentForms.tsx', cf);
console.log('done');
