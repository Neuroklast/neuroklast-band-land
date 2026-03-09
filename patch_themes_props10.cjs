const fs = require('fs');

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/export default function LoadingScreen\(\{ onComplete \}\: LoadingScreenProps\) \{/, 'export default function LoadingScreen({ onComplete }: LoadingScreenProps) {\n  const duration = 2500;');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

let loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
loadZT = loadZT.replace(/export default function LoadingScreen\(\{ onComplete \}\: LoadingScreenProps\) \{/, 'export default function LoadingScreen({ onComplete }: LoadingScreenProps) {');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZT);

console.log('done');
