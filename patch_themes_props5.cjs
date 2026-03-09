const fs = require('fs');

let navNN = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
navNN = navNN.replace(/type NavigationProps = NavigationSlotProps;>[\s\S]*?\n\}/, 'type NavigationProps = NavigationSlotProps;');
navNN = navNN.replace(/export default function Navigation\(\{ \n  items = \[\n    \{ label: 'About', href: '#about' \},\n    \{ label: 'Catalog', href: '#catalog' \},\n    \{ label: 'Contact', href: '#contact' \}\n  \],\n  0 = 0\n\}\: NavigationProps\) \{/, 'export default function Navigation({ items, siteName }: NavigationProps) {');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', navNN);

console.log('done');
