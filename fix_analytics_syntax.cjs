const fs = require('fs');

const file3 = 'src/features/widgets/AnalyticsWidgetContainer.tsx';
let content3 = fs.readFileSync(file3, 'utf8');
content3 = content3.replace("import type { SiteAnalytics } from '@/components/widgets/AnalyticsWidget'>\n}", "import type { SiteAnalytics } from '@/components/widgets/AnalyticsWidget'");
fs.writeFileSync(file3, content3);

const file4 = 'src/features/widgets/BandsintownWidgetContainer.tsx';
let content4 = fs.readFileSync(file4, 'utf8');
content4 = content4.replace("import type { BandsintownEvent } from '@/components/widgets/BandsintownWidget'>\n}", "import type { BandsintownEvent } from '@/components/widgets/BandsintownWidget'");
fs.writeFileSync(file4, content4);
