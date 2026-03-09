const fs = require('fs');

let hub = fs.readFileSync('src/features/admin/components/AdminHubDialog.tsx', 'utf8');
hub = hub.replace(/onOpenDialog\('sections'\)/, "onOpenDialog('design')"); // The sections visibility is part of the customizer now
hub = hub.replace(/onOpenDialog\('plugins'\)/, "onOpenDialog('store')"); // Widgets go through the store

fs.writeFileSync('src/features/admin/components/AdminHubDialog.tsx', hub);

console.log('done');
