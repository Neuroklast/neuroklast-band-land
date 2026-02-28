import { TextAa } from '@phosphor-icons/react'

interface FontSizePickerProps {
  value?: string
  onChange: (size: string) => void
  label?: string
}

const sizes = [
  { label: 'XS', value: '0.75em' },
  { label: 'SM', value: '0.875em' },
  { label: 'BASE', value: '1em' },
  { label: 'LG', value: '1.125em' },
  { label: 'XL', value: '1.25em' },
  { label: '2XL', value: '1.5em' },
]

export default function FontSizePicker({ value, onChange, label }: FontSizePickerProps) {
  // Normalize the value to match one of the options
  const currentValue = sizes.find(s => s.value === value)?.value || '1em'

  return (
    <div className="inline-flex items-center gap-1.5 bg-card/80 border border-primary/20 px-2 py-1 rounded-sm">
      <TextAa size={14} className="text-primary/60 flex-shrink-0" />
      {label && <span className="text-[9px] font-mono text-muted-foreground/60 mr-1">{label}</span>}
      <select
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[10px] font-mono text-foreground/80 border-none outline-none cursor-pointer appearance-none pr-4"
        style={{ WebkitAppearance: 'none', backgroundImage: 'none' }}
      >
        {sizes.map((s) => (
          <option key={s.value} value={s.value} className="bg-card text-foreground">
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}
