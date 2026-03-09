const fs = require('fs');
let heroNN = fs.readFileSync('src/themes/nebula-noir-theme/Hero.tsx', 'utf8');
heroNN = heroNN.replace(/\{ title, subtitle, ctaText, onCtaClick \}/, '{ data, onUpdate }');
heroNN = heroNN.replace(/title/, 'data?.title || "COSMIC"');
heroNN = heroNN.replace(/subtitle/, 'data?.subtitle || "ART DECO GOTH"');
heroNN = heroNN.replace(/ctaText/, '"EXPLORE COLLECTION"');
heroNN = heroNN.replace(/onCtaClick/, '(() => {})');
fs.writeFileSync('src/themes/nebula-noir-theme/Hero.tsx', heroNN);

let navNN = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
navNN = navNN.replace(/\{ items, cartCount \}/, '{ items }');
navNN = navNN.replace(/cartCount/g, '0');
navNN = navNN.replace(/item.href/g, '`#${item.id}`');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', navNN);

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/\{ onComplete, duration = 2500 \}/, '{ onComplete }');
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

let heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
heroZT = heroZT.replace(/\{ siteName, logoUrl, \(\(\) => \{\}\) \}/, '{ data }');
heroZT = heroZT.replace(/siteName/g, 'data?.title || "ZARDONIC"');
heroZT = heroZT.replace(/logoUrl/g, 'data?.logoUrl || ""');
fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZT);

let navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');
navZT = navZT.replace(/\{ siteName, logoUrl, editMode, isOwner, showLoginButton, \(\(\) => \{\}\), onEditClick, onLoginClick, onArtistNameChange \}/, '{ siteName, items }');
navZT = navZT.replace(/isOwner/g, 'false');
navZT = navZT.replace(/editMode/g, 'false');
navZT = navZT.replace(/showLoginButton/g, 'false');
navZT = navZT.replace(/onEditClick/g, '(() => {})');
navZT = navZT.replace(/onLoginClick/g, '(() => {})');
navZT = navZT.replace(/onArtistNameChange/g, '(() => {})');
fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZT);

let loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
loadZT = loadZT.replace(/\{ onComplete, precacheUrls \}/, '{ onComplete }');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZT);

console.log('done');
