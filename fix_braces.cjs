const fs = require('fs');
let nn = fs.readFileSync('src/themes/nebula-noir-theme/index.ts', 'utf8');
nn = nn.replace(/tags: \['art-deco', 'gothic', 'cosmic', 'dark', 'elegant', 'luxury'\],\n    category: 'E-commerce',\n    previewImage: '\/preview-nebula-noir\.png',\n  \}\n\}/g, '}');
nn = nn.replace(/ring: 'oklch\(0\.50 0\.18 295\)',\n  \},/g, '');
nn = nn.replace(/parallaxBackground: true,\n  \},/g, '');
fs.writeFileSync('src/themes/nebula-noir-theme/index.ts', nn);

let zn = fs.readFileSync('src/themes/zardonic/index.ts', 'utf8');
zn = zn.replace(/'muted-foreground': 'oklch\(0\.6 0 0\)',\n  \},/g, '');
zn = zn.replace(/mono: "'Share Tech Mono', monospace",\n  \},/g, '');
fs.writeFileSync('src/themes/zardonic/index.ts', zn);
console.log('done');
