import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

// Try to load Spark runtime (only available on GitHub Spark platform)
import("@github/spark/spark").catch(() => {
  // Spark not available - running on Vercel or other platform
})

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
