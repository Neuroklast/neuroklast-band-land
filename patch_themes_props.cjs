const fs = require('fs');

let codeNN = fs.readFileSync('src/themes/nebula-noir-theme/index.ts', 'utf8');
codeNN = codeNN.replace(/colors:/, '// colors:');
codeNN = codeNN.replace(/effects:/, '// effects:');
codeNN = codeNN.replace(/metadata:/, '// metadata:');
fs.writeFileSync('src/themes/nebula-noir-theme/index.ts', codeNN);

let codeGN = fs.readFileSync('src/themes/glitch-noir/index.ts', 'utf8');
codeGN = codeGN.replace(/colors:/, '// colors:');
fs.writeFileSync('src/themes/glitch-noir/index.ts', codeGN);

let codeZT = fs.readFileSync('src/themes/zardonic/index.ts', 'utf8');
codeZT = codeZT.replace(/colors:/, '// colors:');
codeZT = codeZT.replace(/fonts:/, '// fonts:');
fs.writeFileSync('src/themes/zardonic/index.ts', codeZT);

// Also need to patch the components to accept the standard SlotProps.
const heroNN = fs.readFileSync('src/themes/nebula-noir-theme/Hero.tsx', 'utf8');
const heroNNCleared = heroNN.replace(/interface HeroProps \{[\s\S]*?\}/, `import type { HeroSlotProps } from '@/lib/types'
type HeroProps = HeroSlotProps;`);
fs.writeFileSync('src/themes/nebula-noir-theme/Hero.tsx', heroNNCleared);

const navNN = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
const navNNCleared = navNN.replace(/interface NavigationProps \{[\s\S]*?\}/, `import type { NavigationSlotProps } from '@/lib/types'
type NavigationProps = NavigationSlotProps;`);
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', navNNCleared);

const loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
const loadNNCleared = loadNN.replace(/interface LoadingScreenProps \{[\s\S]*?\}/, `import type { LoadingScreenSlotProps } from '@/lib/types'
type LoadingScreenProps = LoadingScreenSlotProps;`).replace(/duration \= 2500/, 'duration = 2500').replace(/onLoadingComplete/g, 'onComplete');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNNCleared);

const heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
const heroZTCleared = heroZT.replace(/interface HeroProps \{[\s\S]*?\}/, `import type { HeroSlotProps } from '@/lib/types'
type HeroProps = HeroSlotProps;`).replace(/artistName/g, 'siteName').replace(/onNavigate/g, '(() => {})');
fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZTCleared);

const navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');
const navZTCleared = navZT.replace(/interface NavigationProps \{[\s\S]*?\}/, `import type { NavigationSlotProps } from '@/lib/types'
type NavigationProps = NavigationSlotProps;`).replace(/artistName/g, 'siteName').replace(/onNavigate/g, '(() => {})');
fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZTCleared);

const loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
const loadZTCleared = loadZT.replace(/interface LoadingScreenProps \{[\s\S]*?\}/, `import type { LoadingScreenSlotProps } from '@/lib/types'
type LoadingScreenProps = LoadingScreenSlotProps;`).replace(/onLoadComplete/g, 'onComplete');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZTCleared);

console.log('done');
