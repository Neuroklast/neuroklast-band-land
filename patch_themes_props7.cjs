const fs = require('fs');

let heroNN = fs.readFileSync('src/themes/nebula-noir-theme/Hero.tsx', 'utf8');
heroNN = heroNN.replace(/siteName/g, 'name');
heroNN = heroNN.replace(/tagline/g, 'genres[0]');
fs.writeFileSync('src/themes/nebula-noir-theme/Hero.tsx', heroNN);

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/duration = 2500/, '');
loadNN = loadNN.replace(/duration/g, '2500');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

let heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
heroZT = heroZT.replace(/siteName/g, 'name');
fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZT);

let loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
loadZT = loadZT.replace(/precacheUrls: string\[\] = \[\]/, '');
loadZT = loadZT.replace(/precacheUrls/g, '[]');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZT);

console.log('done');
