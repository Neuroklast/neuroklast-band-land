import { motion } from 'framer-motion'
import { LockSimple, CircleNotch } from '@phosphor-icons/react'

interface ActivationLockScreenProps {
  /** When true the key is still being validated — show a loading indicator instead of the lock message. */
  pending?: boolean
}

/**
 * ActivationLockScreen
 *
 * Fullscreen lock shown when no valid activation key is configured,
 * or while the key is being validated (pending=true).
 * Matches the cyberpunk/CRT aesthetic of the rest of the app.
 */
export default function ActivationLockScreen({ pending = false }: ActivationLockScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      <motion.div
        className="relative z-20 flex flex-col items-center gap-8 px-6 text-center max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          animate={pending ? { rotate: 360 } : { scale: [1, 1.06, 1] }}
          transition={pending
            ? { duration: 1, repeat: Infinity, ease: 'linear' }
            : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {pending
            ? <CircleNotch size={72} weight="bold" className="text-[#ff2222] drop-shadow-[0_0_18px_rgba(255,34,34,0.7)]" />
            : <LockSimple size={72} weight="bold" className="text-[#ff2222] drop-shadow-[0_0_18px_rgba(255,34,34,0.7)]" />
          }
        </motion.div>

        {/* Title */}
        <div>
          <h1
            className="font-mono text-2xl md:text-3xl font-bold tracking-widest uppercase"
            style={{
              color: '#ff2222',
              textShadow: '0 0 12px rgba(255,34,34,0.8), 0 0 24px rgba(255,34,34,0.4)',
            }}
          >
            {pending ? 'VALIDATING KEY…' : 'ACCESS DENIED'}
          </h1>
          <p
            className="mt-3 font-mono text-sm md:text-base tracking-wide"
            style={{ color: 'rgba(255,34,34,0.7)' }}
          >
            {pending
              ? 'Checking activation key against central registry…'
              : 'This template requires an activation key.'}
          </p>
        </div>

        {/* Info box — only shown after validation fails */}
        {!pending && (
          <div
            className="w-full rounded border px-6 py-5 font-mono text-sm leading-relaxed"
            style={{
              borderColor: 'rgba(255,34,34,0.35)',
              backgroundColor: 'rgba(255,34,34,0.06)',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            <p>
              <span style={{ color: '#ff2222' }}>VITE_ACTIVATION_KEY</span> is missing or invalid.
            </p>
            <p className="mt-2">
              Set your activation key in the Vercel environment variables to unlock this deployment.
            </p>
          </div>
        )}

        {/* CTA — only shown after validation fails */}
        {!pending && (
          <a
            href="https://github.com/Neuroklast/neuroklast-band-land#-activation--licensing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded border px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-all duration-200"
            style={{
              borderColor: '#ff2222',
              color: '#ff2222',
              textShadow: '0 0 8px rgba(255,34,34,0.6)',
              boxShadow: '0 0 12px rgba(255,34,34,0.2)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.backgroundColor = 'rgba(255,34,34,0.15)'
              el.style.boxShadow = '0 0 24px rgba(255,34,34,0.4)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.backgroundColor = ''
              el.style.boxShadow = '0 0 12px rgba(255,34,34,0.2)'
            }}
          >
            Contact Neuroklast for access
          </a>
        )}

        {/* Subtle note */}
        <p
          className="font-mono text-xs"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          The source code remains publicly readable for educational purposes and AI assistants.
        </p>
      </motion.div>
    </div>
  )
}
