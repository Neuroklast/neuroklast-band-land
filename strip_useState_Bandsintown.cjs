const fs = require('fs');
let content = fs.readFileSync('src/components/widgets/BandsintownWidget.tsx', 'utf8');

// I apparently failed to strip it earlier in the script because the regex didn't match after changing import.
// Let's strip it now.
content = content.replace(/  const \[events, setEvents\] = useState<BandsintownEvent\[\]>\(\[\]\)\n  const \[loading, setLoading\] = useState\(false\)\n  const \[error, setError\] = useState<string \| null>\(null\)/g, "");

content = content.replace(/  useEffect\(\(\) => \{[\s\S]*?  \}, \[config\.artist, config\.appId, config\.showPastDates, displayLimit, t\]\)\n/g, "");

fs.writeFileSync('src/components/widgets/BandsintownWidget.tsx', content);
