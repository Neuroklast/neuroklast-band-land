const fs = require('fs');

let indexNN = fs.readFileSync('src/themes/nebula-noir-theme/index.ts', 'utf8');
indexNN = indexNN.replace(/colorPresets: \[\],/, 'colorPresets: [],\n  effects: {},');
fs.writeFileSync('src/themes/nebula-noir-theme/index.ts', indexNN);

let heroNN = fs.readFileSync('src/themes/nebula-noir-theme/Hero.tsx', 'utf8');
heroNN = heroNN.replace(/data\?\.siteName \|\| "NEBULA NOIR"/, 'siteName');
heroNN = heroNN.replace(/data\?\.tagline \|\| "Cosmic Art Deco Goth"/, 'tagline');
heroNN = heroNN.replace(/export default function Hero\(\{ \n  data, \n   \n\}\: HeroProps\) \{/, 'export default function Hero({ siteName, tagline }: HeroProps) {');
fs.writeFileSync('src/themes/nebula-noir-theme/Hero.tsx', heroNN);

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/export default function LoadingScreen\(\{ onComplete \}\: LoadingScreenProps\) \{/, 'export default function LoadingScreen({ onComplete }: LoadingScreenProps) {\n  const duration = 2500;');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

let heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
heroZT = heroZT.replace(/export default function Hero\(\{ siteName \}\: HeroProps\) \{/, 'export default function Hero({ siteName, logoUrl }: HeroProps) {');
fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZT);

let loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
loadZT = loadZT.replace(/export default function LoadingScreen\(\{ onComplete \}\: LoadingScreenProps\) \{/, 'export default function LoadingScreen({ onComplete }: LoadingScreenProps) {\n  const precacheUrls: string[] = [];');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZT);

console.log('done');
