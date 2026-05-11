const fs = require('fs');

const files = [
  'src/themes/neuroklast-classic/Hero.tsx',
  'src/themes/glitch-noir/Hero.tsx',
  'src/themes/umbrella-corp/Hero.tsx',
  'src/themes/zardonic-industrial/Hero.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<img\s+src=\{logoUrl\}/g, '<img src={logoUrl} fetchPriority="high" loading="eager"');
    content = content.replace(/<img\s+src=\{titleImageUrl\}/g, '<img src={titleImageUrl} fetchPriority="high" loading="eager"');
    fs.writeFileSync(file, content);
  }
}
