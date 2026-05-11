const fs = require('fs');
const file = 'src/components/widgets/AnalyticsWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ useState, useEffect \} from 'react'\n/g, "");
content = content.replace(/  const \[analytics, setAnalytics\] = useState<SiteAnalytics \| null>\(null\)\n  const \[loading, setLoading\] = useState\(true\)\n  const \[isDemo, setIsDemo\] = useState\(false\)\n\n  useEffect\(\(\) => \{[\s\S]*?  \}, \[\]\)\n/g, "");
content = content.replace(/export default function AnalyticsWidget\(\{ widget, themeSettings \}: AnalyticsWidgetProps\) \{/g, `export default function AnalyticsWidget({ widget, themeSettings, analytics, loading, isDemo }: AnalyticsWidgetProps & { analytics?: SiteAnalytics | null, loading?: boolean, isDemo?: boolean }) {`);

fs.writeFileSync(file, content);
