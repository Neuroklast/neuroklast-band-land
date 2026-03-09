const fs = require('fs');

let navZT = fs.readFileSync('src/themes/zardonic/Navigation.tsx', 'utf8');

navZT = navZT.replace(/export default function Navigation\(\{[\s\S]*?\}\: NavigationProps\) \{/, 'export default function Navigation({ siteName, items }: NavigationProps) {');
navZT = navZT.replace(/const sections = \['bio', 'music', 'gigs', 'releases', 'gallery', 'connect'\]/, '');
navZT = navZT.replace(/sections\.map/g, 'items.map');
navZT = navZT.replace(/\(section\)/g, '(item)');
navZT = navZT.replace(/\{section\}/g, '{item.label}');
navZT = navZT.replace(/key=\{item\}/g, 'key={item.id}');
navZT = navZT.replace(/\(\(\) => \{\}\)\(item\)/g, 'window.location.hash = item.id');
navZT = navZT.replace(/\{false \? \([\s\S]*?\) \: \([\s\S]*?logoUrl[\s\S]*?\)\}/g, '<span>{siteName}</span>');
navZT = navZT.replace(/\{false && \(\(\) => \{\}\) && \([\s\S]*?\{false && \(\(\) => \{\}\) && \([\s\S]*?Login\n            <\/Button>\n          \)\}/, '');
navZT = navZT.replace(/handleNavigate\(item\)/, '() => { window.location.hash = item.id; setMobileMenuOpen(false); }');

fs.writeFileSync('src/themes/zardonic/Navigation.tsx', navZT);
console.log('done');
