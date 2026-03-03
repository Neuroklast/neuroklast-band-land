/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// Allow importing .glb files as URLs (handled by Vite's asset pipeline)
declare module '*.glb' {
  const src: string
  export default src
}