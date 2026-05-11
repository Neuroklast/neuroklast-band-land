const fs = require('fs');
let content = fs.readFileSync('src/components/widgets/index.ts', 'utf8');

// The instruction said: Export containers in src/components/widgets/index.ts.
// Actually, earlier the widget file export was:
content = content.replace("export { default as BandsintownWidget } from './BandsintownWidget'", "export { default as BandsintownWidget } from '@/features/widgets/BandsintownWidgetContainer'");
content = content.replace("export { default as AnalyticsWidget } from './AnalyticsWidget'", "export { default as AnalyticsWidget } from '@/features/widgets/AnalyticsWidgetContainer'");
content = content.replace("export { default as SetlistFmWidget } from './SetlistFmWidget'", "export { default as SetlistFmWidget } from '@/features/widgets/SetlistFmWidgetContainer'");

fs.writeFileSync('src/components/widgets/index.ts', content);
