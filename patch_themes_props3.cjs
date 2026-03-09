const fs = require('fs');

let heroNN = fs.readFileSync('src/themes/nebula-noir-theme/Hero.tsx', 'utf8');
heroNN = heroNN.replace(/data\?\.title \|\| "COSMIC" = "NEBULA NOIR"/, 'data');
heroNN = heroNN.replace(/data\?\.subtitle \|\| "ART DECO GOTH" = "Cosmic Art Deco Goth",\n  "EXPLORE COLLECTION" = "EXPLORE COLLECTION",\n  \(\(\) => \{\}\)/, '');
heroNN = heroNN.replace(/\{title\}/, '{data?.siteName || "NEBULA NOIR"}');
heroNN = heroNN.replace(/\{subtitle\}/, '{data?.tagline || "Cosmic Art Deco Goth"}');
heroNN = heroNN.replace(/\{ctaText\}/g, '{"EXPLORE COLLECTION"}');
heroNN = heroNN.replace(/onClick=\{onCtaClick\}/, 'onClick={() => {}}');
fs.writeFileSync('src/themes/nebula-noir-theme/Hero.tsx', heroNN);

let navNN = fs.readFileSync('src/themes/nebula-noir-theme/Navigation.tsx', 'utf8');
navNN = navNN.replace(/\{ items \}/, '{ items, siteName }');
navNN = navNN.replace(/className="text-foreground text-2xl tracking-\[0\.25em\] font-display"/, 'className="text-foreground text-2xl tracking-[0.25em] font-display"');
navNN = navNN.replace(/NEBULA/, '{siteName || "NEBULA NOIR"}');
navNN = navNN.replace(/NOIR/g, '');
fs.writeFileSync('src/themes/nebula-noir-theme/Navigation.tsx', navNN);

let navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');
navZT = navZT.replace(/\{ siteName, items \} \= false \= false \= false \(\(\) => \{\}\) \(\(\) => \{\}\) \(\(\) => \{\}\)/, '{ siteName, items }');
fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZT);

console.log('done');
