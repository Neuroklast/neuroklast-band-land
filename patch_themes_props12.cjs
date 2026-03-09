const fs = require('fs');

let heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
heroZT = heroZT.replace(/name\.logoUrl \|\| "" \|\|/g, 'logoUrl ||');
heroZT = heroZT.replace(/name\.title \|\| "ZARDONIC"/g, 'name || "ZARDONIC"');
fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZT);

console.log('done');
