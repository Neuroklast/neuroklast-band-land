const fs = require('fs');

// Fix AnalyticsWidget
let file = 'src/components/widgets/AnalyticsWidget.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(">\n}", "");
fs.writeFileSync(file, content);

// Fix BandsintownWidget
file = 'src/components/widgets/BandsintownWidget.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/  offers: Array<\{[\s\S]*?  \}>\n\}/, "");
content = content.replace("export default function BandsintownWidget({ widget, themeSettings }: BandsintownWidgetProps) {", "export default function BandsintownWidget({ widget, themeSettings, events = [], loading = false, error = null }: BandsintownWidgetProps) {");
content = content.replace("import { useLocale } from '@/hooks/use-locale'\nimport type { WidgetPlugin, ThemeSettings } from '@/lib/types'\nimport { useLocale } from '@/hooks/use-locale'", "import type { WidgetPlugin, ThemeSettings } from '@/lib/types'\nimport { useLocale } from '@/hooks/use-locale'");
fs.writeFileSync(file, content);
