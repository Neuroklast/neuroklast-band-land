const fs = require('fs');

let navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');
navZT = navZT.replace(/const handleNavigate = \([\s\S]*?100\)\n  \}/, '');
fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZT);

console.log('done');
