const fs = require('fs');

const file = 'src/components/widgets/BandsintownWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

// Strip out state and effect
content = content.replace(/import \{ useState, useEffect \} from 'react'/g, "import { useLocale } from '@/hooks/use-locale'");
content = content.replace(/const \[events, setEvents\] = useState<BandsintownEvent\[\]>\(\[\]\)\n  const \[loading, setLoading\] = useState\(false\)\n  const \[error, setError\] = useState<string \| null>\(null\)/g, "");

const effectRegex = /  useEffect\(\(\) => \{[\s\S]*?  \}, \[config\.artist, config\.appId, config\.showPastDates, displayLimit, t\]\)\n/g;
content = content.replace(effectRegex, "");

// Modify props
content = content.replace(/export default function BandsintownWidget\(\{ widget, themeSettings \}: BandsintownWidgetProps\) \{/g, `export default function BandsintownWidget({
  widget,
  themeSettings,
  events = [],
  loading = false,
  error = null
}: BandsintownWidgetProps & { events?: BandsintownEvent[], loading?: boolean, error?: string | null }) {`);

fs.writeFileSync(file, content);
