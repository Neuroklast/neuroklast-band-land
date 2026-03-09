const fs = require('fs');

let loadNN = fs.readFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', 'utf8');
loadNN = loadNN.replace(/drop-shadow\(0 0 15px rgba\(255, 255, 255, 0\.3\)\) drop-shadow\(0 0 30px rgba\(102, 51, 153, 0\.2\)\)/g, 'drop-shadow(0 0 15px color-mix(in oklch, var(--foreground) 30%, transparent)) drop-shadow(0 0 30px color-mix(in oklch, var(--primary) 20%, transparent))');
loadNN = loadNN.replace(/boxShadow: '0 0 15px rgba\(255, 255, 255, 0\.5\), 0 0 30px rgba\(102, 51, 153, 0\.3\)'/g, "boxShadow: '0 0 15px color-mix(in oklch, var(--foreground) 50%, transparent), 0 0 30px color-mix(in oklch, var(--primary) 30%, transparent)'");
loadNN = loadNN.replace(/boxShadow: '0 0 8px rgba\(255, 255, 255, 0\.8\)'/g, "boxShadow: '0 0 8px color-mix(in oklch, var(--foreground) 80%, transparent)'");
fs.writeFileSync('src/themes/nebula-noir-theme/LoadingScreen.tsx', loadNN);

let bgNN = fs.readFileSync('src/themes/nebula-noir-theme/BackgroundEffects.tsx', 'utf8');
bgNN = bgNN.replace(/ctx\.shadowColor = 'rgba\(255, 255, 255, 0\.3\)'/g, "ctx.shadowColor = 'var(--foreground)'\n      ctx.globalAlpha = 0.3");
bgNN = bgNN.replace(/ctx\.strokeStyle = \`rgba\(147, 112, 219, \$\{line\.opacity\}\)\`/g, "ctx.strokeStyle = 'var(--primary)'\n        ctx.globalAlpha = line.opacity");
fs.writeFileSync('src/themes/nebula-noir-theme/BackgroundEffects.tsx', bgNN);

let stylesNN = fs.readFileSync('src/themes/nebula-noir-theme/styles.css', 'utf8');
stylesNN = stylesNN.replace(/rgba\(255, 255, 255, (.*?)\)/g, 'color-mix(in oklch, var(--foreground) calc($1 * 100%), transparent)');
stylesNN = stylesNN.replace(/rgba\(147, 112, 219, (.*?)\)/g, 'color-mix(in oklch, var(--primary) calc($1 * 100%), transparent)');
fs.writeFileSync('src/themes/nebula-noir-theme/styles.css', stylesNN);

let stylesZT = fs.readFileSync('src/themes/zardonic/styles.css', 'utf8');
stylesZT = stylesZT.replace(/rgba\(255, 0, 100, (.*?)\)/g, 'color-mix(in oklch, var(--primary) calc($1 * 100%), transparent)');
stylesZT = stylesZT.replace(/rgba\(0, 255, 255, (.*?)\)/g, 'color-mix(in oklch, var(--accent) calc($1 * 100%), transparent)');
stylesZT = stylesZT.replace(/rgba\(var\(--primary-rgb, 180, 50, 50\), (.*?)\)/g, 'color-mix(in oklch, var(--primary) calc($1 * 100%), transparent)');
fs.writeFileSync('src/themes/zardonic/styles.css', stylesZT);

console.log('done');
