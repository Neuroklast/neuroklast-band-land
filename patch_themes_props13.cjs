const fs = require('fs');

let heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
heroZT = heroZT.replace(/import logoImage from '.*?'/, 'const logoImage = ""');
fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZT);

console.log('done');
