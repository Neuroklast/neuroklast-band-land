const fs = require('fs');

// Fix AnalyticsWidget
let file = 'src/components/widgets/AnalyticsWidget.tsx';
let content = fs.readFileSync(file, 'utf8');

// remove bottom export interface SiteAnalytics
content = content.replace(/export interface SiteAnalytics \{[\s\S]*?\}/, "");
// change top interface to export
content = content.replace("interface SiteAnalytics {", "export interface SiteAnalytics {");
fs.writeFileSync(file, content);

// Fix BandsintownWidget
file = 'src/components/widgets/BandsintownWidget.tsx';
content = fs.readFileSync(file, 'utf8');

content = content.replace(/export interface BandsintownEvent \{[\s\S]*?\}/, "");
content = content.replace("interface BandsintownEvent {", "export interface BandsintownEvent {");
// update BandsintownWidgetProps to export and include events, etc.
content = content.replace(/interface BandsintownWidgetProps \{[\s\S]*?\}/, `export interface BandsintownWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
  events?: BandsintownEvent[]
  loading?: boolean
  error?: string | null
}`);
content = content.replace("BandsintownWidgetProps & { events?: BandsintownEvent[], loading?: boolean, error?: string | null }", "BandsintownWidgetProps");
content = content.replace("import { useState, useEffect } from 'react'", "import { useLocale } from '@/hooks/use-locale'");

fs.writeFileSync(file, content);

// Fix AnalyticsWidgetProps
file = 'src/components/widgets/AnalyticsWidget.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/interface AnalyticsWidgetProps \{[\s\S]*?\}/, `export interface AnalyticsWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
  analytics?: SiteAnalytics | null
  loading?: boolean
  isDemo?: boolean
}`);
content = content.replace("AnalyticsWidgetProps & { analytics?: SiteAnalytics | null, loading?: boolean, isDemo?: boolean }", "AnalyticsWidgetProps");
fs.writeFileSync(file, content);

// Fix SetlistFmWidgetProps
file = 'src/components/widgets/SetlistFmWidget.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/interface SetlistFmWidgetProps \{[\s\S]*?\}/, `export interface SetlistFmWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
  setlists?: SetlistItem[]
  loading?: boolean
  apiUnavailable?: boolean
}`);
content = content.replace("SetlistFmWidgetProps & { setlists?: SetlistItem[], loading?: boolean, apiUnavailable?: boolean }", "SetlistFmWidgetProps");
fs.writeFileSync(file, content);
