# Nebula Noir Theme - Modular Component Architecture

Ein modulares Theme-System für Spark-Anwendungen, das austauschbare UI-Komponenten mit strikter Architektur bietet.

## Architektur-Prinzipien

### 1. Komponenten-Slots

Das Theme besteht aus **6 definierten Slots**, die jeweils eine spezifische Rolle haben:

- **Hero.tsx** - Der oberste Einstiegsbereich (z.B. Hero-Section mit Parallax)
- **Navigation.tsx** - Die Menüstruktur
- **Card.tsx** - Wrapper-Element für Inhaltsblöcke
- **BackgroundEffects.tsx** - Fixed Layer für visuelle Effekte (pointer-events-none)
- **SectionDivider.tsx** - Visueller Trenner zwischen Sektionen
- **LoadingScreen.tsx** - Immersiver Ladebildschirm

### 2. Design Tokens

**Keine statischen Farbnamen!** Das System nutzt ausschließlich semantische Tailwind-Klassen:

✅ **Erlaubt:**
```tsx
<div className="bg-background text-foreground border-border">
<button className="bg-primary text-primary-foreground">
<p className="text-muted-foreground">
```

❌ **Verboten:**
```tsx
<div className="bg-red-500"> // NIEMALS statische Farben
<button className="text-blue-300"> // NIEMALS statische Farben
```

### 3. CSS Kapselung

Alle Custom-Klassen in `styles.css` verwenden das Präfix `spark-theme-*`:

```css
.spark-theme-bioshock-glow { ... }
.spark-theme-art-deco-button { ... }
.spark-theme-card-wrapper { ... }
```

Dies verhindert globale CSS-Kollisionen zwischen verschiedenen Themes.

### 4. Theme Registry

Die `index.ts` exportiert das Theme-Objekt mit Metadaten:

```typescript
export const sparkTheme = {
  id: 'nebula-noir-theme',
  name: 'Nebula Noir',
  colors: { ... },
  fonts: { ... },
  effects: { ... },
  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen
  }
}
```

## Verwendung

### Import des Themes

```typescript
import sparkTheme, {
  Hero,
  Navigation,
  Card
} from '@/themes/nebula-noir-theme'
```

### Verwendung der Komponenten

```tsx
import { Hero, Card, SectionDivider } from '@/themes/nebula-noir-theme'

function App() {
  return (
    <>
      <Hero
        title="NEBULA NOIR"
        subtitle="Cosmic Art Deco Goth"
        ctaText="EXPLORE COLLECTION"
        onCtaClick={() => console.log('CTA clicked')}
      />

      <SectionDivider symbol="☾" />

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <h3 className="text-foreground">Product 1</h3>
          <p className="text-muted-foreground">Description</p>
        </Card>

        <Card hoverable={false}>
          <h3 className="text-foreground">Product 2</h3>
          <p className="text-muted-foreground">Description</p>
        </Card>
      </div>
    </>
  )
}
```

## Komponenten-APIs

### Hero

```typescript
interface HeroProps {
  title?: string
  subtitle?: string
  ctaText?: string
  onCtaClick?: () => void
}
```

### Navigation

```typescript
interface NavigationProps {
  items?: Array<{ label: string; href: string }>
  logo?: string
  cartCount?: number
}
```

### Card

```typescript
interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  delay?: number
}
```

### SectionDivider

```typescript
interface SectionDividerProps {
  symbol?: string  // Default: '☾'
  className?: string
}
```

### LoadingScreen

```typescript
interface LoadingScreenProps {
  onLoadingComplete?: () => void
  duration?: number  // Default: 3000ms
}
```

### BackgroundEffects

Keine Props - rendert automatisch parallaxe Art-Deco-Linien im Hintergrund.

## Styling-Klassen

### Text Glow

```tsx
<h1 className="spark-theme-bioshock-glow">
  Glowing Text
</h1>
```

### Buttons

```tsx
<button className="spark-theme-art-deco-button">
  Art Deco Button
</button>
```

### Animations

```tsx
<div className="spark-theme-fade-in spark-theme-stagger-1">
  Animated Content
</div>
```

## Theme-Eigenschaften

### Farben (OKLCH)

- **Primary:** `oklch(0.50 0.18 295)` - Nebula Violet
- **Background:** `oklch(0.08 0 0)` - Void Black
- **Foreground:** `oklch(0.98 0 0)` - Starlight White

### Fonts

- **Display:** Poiret One (Art Deco Headlines)
- **Body:** Montserrat (Clean Body Text)
- **Heading:** Cinzel (Elegant Subheadings)

### Effekte

- ✅ CRT Flicker
- ✅ Scanline Animation
- ✅ Cursor Glow (Phosphor Effect)
- ✅ Parallax Background Lines

## Best Practices

1. **Verwende immer semantische Farben** (`bg-background` statt `bg-black`)
2. **Präfixe alle Custom-Klassen** mit `spark-theme-`
3. **BackgroundEffects immer mit pointer-events-none**
4. **Komponenten sollten Props für Flexibilität anbieten**
5. **Alle Animationen in styles.css kapseln**

## Integration in bestehende Apps

```typescript
// In deiner App.tsx
import { BackgroundEffects } from '@/themes/nebula-noir-theme'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundEffects />
      <div className="relative z-10">
        {/* Dein Content hier */}
      </div>
    </div>
  )
}
```

## Neues Theme erstellen

1. Kopiere die Struktur von `nebula-noir-theme/`
2. Benenne alle Klassen mit neuem Präfix um (z.B. `spark-theme-myname-*`)
3. Passe `colors`, `fonts`, `effects` im `index.ts` an
4. Exportiere alle 6 Slot-Komponenten
5. Registriere das Theme in der Theme-Registry

## Lizenz

Made for Nebula Noir - Cosmic Art Deco Goth
