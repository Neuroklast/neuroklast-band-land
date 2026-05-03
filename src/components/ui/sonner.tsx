import { CSSProperties } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

// The app uses its own theme engine (ThemeContext / ThemeProvider) rather than
// next-themes. Sonner is always rendered inside a dark cyberpunk environment,
// so we pin the theme to "dark" and let our CSS custom properties handle
// the actual colors via the --normal-bg / --normal-text / --normal-border overrides.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
