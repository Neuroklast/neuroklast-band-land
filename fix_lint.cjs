const fs = require('fs');

let ahd = fs.readFileSync('src/features/admin/components/AdminHubDialog.tsx', 'utf8');
ahd = ahd.replace(/\{ item \}\: \{ item: any \}/g, '{ item }: { item: { label: string; icon: any; action?: () => void; description?: string; disabled?: boolean; } }');
ahd = ahd.replace(/themeSettings=\{.*? as any\}/g, 'themeSettings={{} as unknown as SiteConfig["themeSettings"]}');
ahd = ahd.replace(/sectionVisibility=\{.*? as any\}/g, 'sectionVisibility={{} as unknown as SiteConfig["sectionVisibility"]}');
fs.writeFileSync('src/features/admin/components/AdminHubDialog.tsx', ahd);

let nnn = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
nnn = nnn.replace(/\{0 > 0 && \(/g, '{false && (');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', nnn);

let vk = fs.readFileSync('api/validate-key.ts', 'utf8');
vk = vk.replace(/\(data: any\)/g, '(data: Record<string, unknown>)');
fs.writeFileSync('api/validate-key.ts', vk);

let cf = fs.readFileSync('src/features/admin/components/ContentForms.tsx', 'utf8');
cf = cf.replace(/any/g, 'unknown');
fs.writeFileSync('src/features/admin/components/ContentForms.tsx', cf);

console.log('done');
