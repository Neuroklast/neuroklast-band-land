const fs = require('fs');
let content = fs.readFileSync('api/_ratelimit.ts', 'utf8');
content = content.replace("return forwarded.split(',')[0].trim()", "return forwarded.split(',').pop()!.trim()");
fs.writeFileSync('api/_ratelimit.ts', content);
