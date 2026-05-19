import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import compression from 'vite-plugin-compression2';

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
// Use Vite's `mode` parameter (reliable) instead of process.env.NODE_ENV to
// detect production builds — mode is 'production' for `vite build` and
// 'development' for `vite dev`/`vite preview`.
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isProduction ? [
        compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
        compression({ algorithm: 'brotliCompress', exclude: [/\.(br)$/, /\.(gz)$/] }),
      ] : []),
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    build: {
      rollupOptions: {
        // Server-only packages — these are used exclusively in Vercel serverless
        // functions (api/*.js) and must never be bundled into the client build.
        // Vite/Rollup should tree-shake them out automatically because they are
        // not imported anywhere in src/, but listing them here makes that intent
        // explicit and prevents accidental client-side bundling if an import
        // ever slips through.
        external: [
          '@vercel/kv',
          '@upstash/ratelimit',
          'sharp',
          'resend',
        ],
        output: {
          // ── Vendor chunk splitting for long-term caching ──────────────────
          // Each chunk groups packages that change together so that unrelated
          // library updates don't bust each other's cache entries.
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-is'],
            'vendor-radix': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-aspect-ratio',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip',
            ],
            'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
            'vendor-motion': ['framer-motion'],
            'vendor-charts': ['recharts'],
            'vendor-i18n': [
              'i18next',
              'react-i18next',
              'i18next-browser-languagedetector',
              'i18next-http-backend',
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      exclude: ['node_modules', 'dist', 'src/_theme_inbox'],
    },
  };
});
