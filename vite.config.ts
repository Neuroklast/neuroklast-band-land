import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import JavaScriptObfuscator from 'javascript-obfuscator';
import type { ObfuscatorOptions } from 'javascript-obfuscator';
import type { OutputBundle } from 'rollup';

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
      ...(isProduction ? [{
        name: 'vite:obfuscatefiles',
        generateBundle(_options: unknown, bundle: OutputBundle) {
          const obfuscatorOptions: ObfuscatorOptions = {
            compact: true,
            controlFlowFlattening: false,
            controlFlowFlatteningThreshold: 0,
            deadCodeInjection: false,
            debugProtection: false,
            debugProtectionInterval: 0,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'mangled',
            log: false,
            numbersToExpressions: false,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.5,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChunkSize: 2,
            stringArrayWrappersParametersMaxCount: 4,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.6,
            unicodeEscapeSequence: false,
          };
          console.log('\nObfuscate files');
          for (const [fileName, chunk] of Object.entries(bundle)) {
            if (chunk.type === 'chunk' && chunk.code) {
              console.log(`Obfuscating ${fileName}...`);
              chunk.code = JavaScriptObfuscator.obfuscate(chunk.code, obfuscatorOptions).getObfuscatedCode();
            }
          }
          console.log('Obfuscate done');
        },
      }] : []),
    ],
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src')
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
