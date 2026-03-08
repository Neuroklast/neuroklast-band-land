REGELN FÜR DIE ERSTELLUNG UND BEARBEITUNG VON KOMPONENTEN (DESIGN SYSTEM)

Du befindest dich in einem Projekt mit einer strikten Trennung von Struktur (Themes) und Farben (Presets). Wenn du neue React Komponenten erstellst oder bestehende bearbeitest, musst du folgende Gesetze ausnahmslos befolgen.

1. KEINE THEME SPEZIFISCHEN KOMPONENTEN
Du darfst niemals mehrere Versionen derselben Komponente für verschiedene Designs erstellen. Es gibt keine CyberpunkCard.tsx oder MinimalCard.tsx. Es gibt immer nur eine einzige allgemeingültige Version.

2. KEINE HARTCODIERTEN FARBEN IN TAILWIND
Verwende niemals statische Tailwind Farben wie bg-red-500, text-blue-300 oder border-gray-800. 
Du darfst ausschließlich unsere globalen Design Tokens verwenden. Diese sind:
Hintergründe: bg-background, bg-card, bg-popover, bg-muted
Texte: text-foreground, text-primary, text-muted-foreground
Akzente: bg-primary, bg-accent, border-primary, border-border

3. KEINE LOKALEN EFFEKTE
Verwende niemals inline Styles für komplexe Layouts. Wenn eine Komponente spezielle Formen, Ecken, Rahmen oder Animationen benötigt, fügst du unsichtbare Platzhalter Divs in das React Markup ein (z.B. <div className="theme-widget-corner" aria-hidden="true" />).
Diese Platzhalter werden standardmäßig im CSS ausgeblendet und ausschließlich über globale CSS Regeln in der Datei src/styles/theme-slots.css aktiviert, wenn das entsprechende [data-theme="..."] Attribut aktiv ist.

4. KEINE DIREKTEN DOM MANIPULATIONEN
Komponenten dürfen das Aussehen nicht selbst über document.documentElement ändern. Das Aussehen wird zentral über den globalen React Zustand und die globale Layout Engine gesteuert.

5. FEATURE-SLICED DESIGN (FSD) ERZWINGEN
Du darfst keine komplexen Komponenten mit Geschäftslogik im Ordner src/components/ ablegen. Dieser Ordner ist ausschließlich für dumme, wiederverwendbare UI-Primitiven (Buttons, Inputs) reserviert.
Jedes neue logische Modul muss in eine eigene Domäne unter src/features/ (z.B. src/features/gigs/, src/features/admin/) gekapselt werden. Jede Feature-Domäne enthält ihre eigenen Komponenten, Hooks und API-Aufrufe.

6. STRIKTE ADMIN-ISOLIERUNG (CODE SPLITTING)
Admin-Komponenten dürfen niemals direkt in öffentliche Client-Routen importiert werden. Wenn du eine Admin-Komponente (wie den ConfigEditor oder SetupWizard) in den Hauptbaum einhängst, musst du zwingend React.lazy() und <Suspense> verwenden. Das öffentliche JavaScript-Bundle darf keinen Byte Admin-Logik enthalten.

7. DATA FETCHING UND STATE MANAGEMENT
Schreibe niemals manuelle fetch-Aufrufe innerhalb von useEffect-Hooks, um Daten zu laden. 
Jegliche Kommunikation mit dem Backend (/api) muss zwingend über TanStack Query (React Query) abstrahiert werden. Erstelle dafür dedizierte Custom Hooks (z.B. useGigsQuery), die Caching, Loading-States und Retries übernehmen.

8. TYPESCRIPT STRICTNESS
Die Verwendung von "any" ist strikt verboten. Jede API-Antwort, jeder Component-Prop und jeder Zustand muss durch ein TypeScript-Interface oder einen Zod-Schema-Typ typisiert sein. Lege globale Typen in src/lib/types.ts ab oder kapsle sie in den jeweiligen Feature-Ordnern.

9. SICHERHEIT UND UMGEBUNGSVARIABLEN
Speichere niemals API-Keys (z.B. Spotify, Bandsintown) im React-Code oder im lokalen State. Sensible Keys gehören ausschließlich in serverseitige Umgebungsvariablen oder in die Vercel KV Datenbank des jeweiligen Tenants.
Umgebungsvariablen für das Frontend müssen zwingend mit VITE_ präfigiert sein.

10. SPRACHE UND BENENNUNG
Variablen, Funktionen, Dateinamen und Code-Kommentare müssen ausnahmslos auf Englisch geschrieben werden. 

11. STRUKTURELLE DEFINITIONEN: THEMES VS. PRESETS
Du musst die architektonische Trennung zwischen Themes und Presets unter allen Umständen respektieren.
- THEME (Layout Engine): Ein Theme definiert AUSSCHLIESSLICH die Struktur, das Layout, DOM-Platzhalter, komplexe CSS-Formen (clip-path) und Hardware-Animationen. Ein Theme wird über das HTML-Attribut [data-theme="..."] aktiviert. Ein Theme enthält NIEMALS Farbwerte oder Schriftarten.
- PRESET (Design Palette): Ein Preset definiert AUSSCHLIESSLICH globale CSS-Variablen für Farben (Primary, Accent, Background), Typografie und Rundungen (Radius). Ein Preset hat NIEMALS eine Referenz auf ein strukturelles Theme und verändert niemals das HTML-Markup.

12. CLEAN CODE UND SOFTWAREQUALITÄT
- Early Returns: Vermeide tiefe if/else-Verschachtelungen. Nutze Guard Clauses am Anfang von Funktionen, um Fehlerzustände oder fehlende Daten (z.B. loading states) sofort abzufangen.
- Single Responsibility Principle (SRP): Jede Komponente und jeder Custom Hook darf nur exakt eine Aufgabe haben. Wenn eine Datei mehr als 250 Zeilen Code erreicht, ist das ein Indikator dafür, dass Logik in Unterkomponenten oder Hooks extrahiert werden muss.
- Keine toten Code-Pfade: Kommentierter Code und console.log() Befehle dürfen niemals in Commits landen oder bei Code-Erweiterungen generiert werden.
- Destrukturierung: Nutze konsequent Object-Destructuring für Props und State-Objekte, um den Code lesbar zu halten.

13. ERWEITERBARKEIT UND PLUGIN-ARCHITEKTUR (OPEN/CLOSED PRINCIPLE)
- Das System ist offen für Erweiterungen, aber geschlossen für Modifikationen der Core-Engine.
- Wenn du ein neues Widget (z.B. Spotify, YouTube, Newsletter) erstellst, darfst du dieses NIEMALS hartcodiert in bestehende Layout-Komponenten schreiben.
- Jedes neue Widget muss als eigenständiges Modul entwickelt und ausschließlich über die WidgetRegistry (src/lib/widget-registry.ts) im System angemeldet werden. Die Hauptanwendung lädt Widgets nur dynamisch über diese Schnittstelle.

14. ERROR HANDLING
- Vertraue niemals auf externe Daten. Jede API-Antwort und jede Eingabe des Endnutzers muss validiert werden (bevorzugt über Zod-Schemas).
- UI-Komponenten dürfen bei fehlerhaften Daten nicht die gesamte Anwendung zum Absturz bringen. Umschließe fehleranfällige Module (wie externe Widgets oder komplexe Editoren) mit ErrorBoundaries und rendere stattdessen sichere Fallback-UIs.

15. LIZENZIERUNG UND MASTER-INSTANZ
- Es gibt eine Master-Instanz (neuroklast.net) und Tenant-Instanzen (Kunden-Deployments).
- Lizenzprüfungen für Premium-Features dürfen NIEMALS gegen lokale Datenbanken erfolgen. Sie müssen zwingend über den Master-Server validiert werden.
- Nutze für den Bypass von Berechtigungen auf der Master-Instanz NIEMALS Umgebungsvariablen (wie VITE_IS_PRIMARY), da diese von Tenants manipuliert werden können.
- Der Super-User-Bypass darf ausschließlich über einen strikten Hostname-Check gegen "neuroklast.net" im Window-Objekt oder in den Request-Headern erfolgen.
- 
16. ASSET MANAGEMENT UND DATENBANK-LIMITS
- Vercel KV ist ein reiner Key-Value-Store für flache JSON-Konfigurationen. 
- Speichere NIEMALS hochgeladene Bilder, Logos oder Audio-Dateien als Base64-Strings in der Vercel KV Datenbank. Das führt zu einer sofortigen Überlastung des Speichers und extremen Kosten.
- Nutze für Bild-Assets ausschließlich URLs (Hosting über externe Storage-Provider) und verarbeite sie über unsere lokalen Image-Proxy-Routen (/api/image-proxy), um CORS-Probleme zu umgehen.

17. RESILIENZ UND GRACE PERIOD (AUSFALLSICHERHEIT)
- Wenn der Master-Server (neuroklast.net) ausfällt oder nicht erreichbar ist, darf die öffentliche Website des Kunden nicht offline gehen oder abstürzen.
- Implementiere eine "Grace Period" für Lizenzen: Einmal durch den Master-Server validierte Schlüssel müssen lokal in der KV-Datenbank des Kunden mit einem Timestamp zwischengespeichert werden (z.B. für 7 Tage). Bei Netzwerkausfällen greift der Code auf diesen Cache zurück.
