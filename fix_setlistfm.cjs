const fs = require('fs');
const file = 'src/components/widgets/SetlistFmWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ useState, useEffect \} from 'react'\n/g, "");
content = content.replace(/  const \[setlists, setSetlists\] = useState<SetlistItem\[\]>\(\[\]\)\n  const \[loading, setLoading\] = useState\(false\)\n  const \[apiUnavailable, setApiUnavailable\] = useState\(false\)\n\n  useEffect\(\(\) => \{[\s\S]*?  \}, \[config\.artistMbid\]\)\n/g, "");
content = content.replace(/export default function SetlistFmWidget\(\{ widget, themeSettings \}: SetlistFmWidgetProps\) \{/g, `export default function SetlistFmWidget({ widget, themeSettings, setlists = [], loading = false, apiUnavailable = false }: SetlistFmWidgetProps & { setlists?: SetlistItem[], loading?: boolean, apiUnavailable?: boolean }) {`);

fs.writeFileSync(file, content);
