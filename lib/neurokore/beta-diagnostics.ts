import { z } from 'zod'

/** Intentionally no message, stack trace, user ID or machine ID fields. Unknown fields fail. */
export const betaDiagnosticSchema = z.object({
  schema: z.literal(1),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-beta)?$/).max(24),
  code: z.enum(['session-start', 'js-error', 'promise-rejection', 'manual-test', 'native-timeout']),
  os: z.enum(['windows11', 'windows', 'macos', 'linux', 'other']),
  host: z.enum(['fl-studio', 'ableton', 'reaper', 'bitwig', 'cubase', 'studio-one',
    'logic', 'pro-tools', 'reason', 'garageband', 'other']),
  format: z.enum(['vst3', 'au', 'standalone', 'other']),
  cpuCores: z.union([z.literal(2), z.literal(4), z.literal(8), z.literal(16), z.literal(32)]),
  memoryGb: z.union([z.literal(8), z.literal(16), z.literal(32), z.literal(64)]),
  sampleRate: z.union([z.literal(0), z.literal(44100), z.literal(48000),
    z.literal(88200), z.literal(96000), z.literal(192000)]),
  bufferSize: z.number().int().min(0).max(8192),
  bundle: z.string().regex(/^[a-zA-Z0-9_-]{1,70}\.js$/).optional(),
  line: z.number().int().min(1).max(100000).optional(),
}).strict()

export type BetaDiagnostic = z.infer<typeof betaDiagnosticSchema>
