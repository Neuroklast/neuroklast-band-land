const fs = require('fs');

let navNN = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
navNN = navNN.replace(/export default function Navigation\(\{ \n  \{ items, siteName \}\n  0\n\}\: NavigationProps\) \{/, 'export default function Navigation({ items, siteName }: NavigationProps) {');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', navNN);

let navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');
navZT = navZT.replace(/export default function Navigation\(\{\n  \{ siteName, items \}\n\}\: NavigationProps\) \{/, 'export default function Navigation({ siteName, items }: NavigationProps) {');
fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZT);

let indexZT = fs.readFileSync('src/themes/zardonic/index.ts', 'utf8');
indexZT = indexZT.replace(/\/\/   \},\n  slots: \{/g, '  slots: {');
fs.writeFileSync('src/themes/zardonic/index.ts', indexZT);

console.log('done');
