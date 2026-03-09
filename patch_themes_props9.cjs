const fs = require('fs');

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/transition=\{\{ 2500: /g, 'transition={{ duration: ');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

console.log('done');
