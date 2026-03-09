const fs = require('fs');

let heroNN = fs.readFileSync('src/themes/nebula-noir-theme/Hero.tsx', 'utf8');
heroNN = heroNN.replace(/export default function Hero\(\{ name, genres\[0\] \}\: HeroProps\) \{/, 'export default function Hero({ name, genres }: HeroProps) {\n  const tagline = genres?.[0];');
fs.writeFileSync('src/themes/nebula-noir-theme/Hero.tsx', heroNN);

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/export default function LoadingScreen\(\{ onComplete \}\: LoadingScreenProps\) \{\n  const  = 2500;/, 'export default function LoadingScreen({ onComplete }: LoadingScreenProps) {');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

let loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
loadZT = loadZT.replace(/export default function LoadingScreen\(\{ onComplete \}\: LoadingScreenProps\) \{\n  const  = \[\];/, 'export default function LoadingScreen({ onComplete }: LoadingScreenProps) {');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZT);

console.log('done');
