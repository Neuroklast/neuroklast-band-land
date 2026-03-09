const fs = require('fs');

let navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');
navZT = navZT.replace(/drop-shadow\(2px 0 0 rgba\(255,0,100,0\.3\)\) drop-shadow\(-2px 0 0 rgba\(0,255,255,0\.3\)\)/g, 'drop-shadow(2px 0 0 color-mix(in oklch, var(--primary) 30%, transparent)) drop-shadow(-2px 0 0 color-mix(in oklch, var(--accent) 30%, transparent))');
fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZT);

console.log('done');
