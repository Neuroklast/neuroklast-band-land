const fs = require('fs');

let heroZT = fs.readFileSync('src/themes/zardonic/Hero.tsx', 'utf8');
heroZT = heroZT.replace(/data\?/g, 'siteName');
heroZT = heroZT.replace(/\{ data \}/, '{ siteName }');
heroZT = heroZT.replace(/\(\(\) => \{\}\)\('music'\)/g, '(() => {})()');
heroZT = heroZT.replace(/\(\(\) => \{\}\)\('gigs'\)/g, '(() => {})()');

fs.writeFileSync('src/themes/zardonic/Hero.tsx', heroZT);

let loadZT = fs.readFileSync('src/themes/zardonic/LoadingScreen.tsx', 'utf8');
loadZT = loadZT.replace(/\{ onComplete, precacheUrls \}/, '{ onComplete }');
fs.writeFileSync('src/themes/zardonic/LoadingScreen.tsx', loadZT);

console.log('done');
