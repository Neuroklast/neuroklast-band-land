const fs = require('fs');

const file = 'src/components/widgets/BandsintownWidget.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/export default function BandsintownWidget\(\{ \n  widget, \n  themeSettings, \n  events = \[\], \n  loading = false, \n  error = null \n\}: BandsintownWidgetProps & \{ events\?: BandsintownEvent\[\], loading\?: boolean, error\?: string \| null \}\) \{/g, `export default function BandsintownWidget({
  widget,
  themeSettings,
  events = [],
  loading = false,
  error = null
}: BandsintownWidgetProps & { events?: any[], loading?: boolean, error?: string | null }) {`);

// Just export interface in container? No, replace the props interface in component so container can use it.
content = content.replace("export default function BandsintownWidget", `export interface BandsintownEvent {
  id: string
  url: string
  datetime: string
  title: string
  venue: {
    name: string
    latitude: string
    longitude: string
    city: string
    region: string
    country: string
  }
  offers: Array<{
    type: string
    url: string
    status: string
  }>
}

export default function BandsintownWidget`);

// Make sure it takes events
content = content.replace(/BandsintownWidgetProps & \{ events\?: any\[\], loading\?: boolean, error\?: string \| null \}/, "BandsintownWidgetProps & { events?: BandsintownEvent[], loading?: boolean, error?: string | null }");

fs.writeFileSync(file, content);

// And update Analytics Widget Props
const file2 = 'src/components/widgets/AnalyticsWidget.tsx';
let content2 = fs.readFileSync(file2, 'utf8');

content2 = content2.replace(/export default function AnalyticsWidget/, `export interface SiteAnalytics {
  totalPageViews: number
  totalSessions: number
  avgSessionDurationMs: number | null
  bounceRate: number | null
  dailyStats: Array<{ date: string; pageViews: number; sessions: number }>
}

export default function AnalyticsWidget`);

fs.writeFileSync(file2, content2);
