declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMeta {
  glob: <T = unknown>(
    pattern: string,
    options?: {
      eager?: boolean
      import?: string
      query?: string
    }
  ) => Record<string, T>
}

declare module '*.glb' {
  const src: string
  export default src
}

declare module '*.css'
declare module '*.wav' {
  const src: string
  export default src
}
declare module '*.mp3' {
  const src: string
  export default src
}
