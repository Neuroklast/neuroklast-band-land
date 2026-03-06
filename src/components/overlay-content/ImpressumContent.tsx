import { motion } from 'framer-motion'
import type { Impressum } from '@/lib/types'

/** Impressum content — legal entity info */
export default function ImpressumContent({ impressum }: { impressum: Impressum }) {
  return (
    <motion.div
      className="p-4 md:p-6 font-mono space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {[
        { label: '// ENTITY.IDENTIFIER', value: impressum.name || impressum.nameEn },
        { label: '// ENTITY.CARE_OF', value: impressum.careOf || impressum.careOfEn },
        { label: '// ENTITY.STREET', value: impressum.street || impressum.streetEn },
        { label: '// ENTITY.CITY', value: impressum.zipCity || impressum.zipCityEn },
        { label: '// CONTACT.PHONE', value: impressum.phone },
        { label: '// CONTACT.EMAIL', value: impressum.email },
        { label: '// RESPONSIBLE.NAME', value: impressum.responsibleName || impressum.responsibleNameEn },
        { label: '// RESPONSIBLE.ADDRESS', value: impressum.responsibleAddress || impressum.responsibleAddressEn },
      ]
        .filter(({ value }) => value)
        .map(({ label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.06 }}
          >
            <p className="text-[10px] text-primary/50 tracking-wider data-label">{label}</p>
            <p className="text-sm text-foreground mt-0.5">{value}</p>
          </motion.div>
        ))}
    </motion.div>
  )
}
