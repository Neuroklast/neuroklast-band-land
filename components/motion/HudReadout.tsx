export type HudReadoutItem = {
  label: string
  value: string
  hot?: boolean
  hiddenOnMobile?: boolean
}

export function HudReadout({ items }: { items: HudReadoutItem[] }) {
  return (
    <div
      className={`grid w-full grid-cols-2 gap-x-8 gap-y-1 font-mono text-[9px] uppercase tracking-widest text-primary/55 ${items.length >= 4 ? 'sm:grid-cols-4' : ''}`}
    >
      {items.map((item) => (
        <span
          key={item.label}
          className={`flex justify-between gap-2 ${item.hiddenOnMobile ? 'hidden sm:flex' : ''}`}
        >
          <span className="text-primary/35">{item.label}</span>
          <span className={`tabular-nums ${item.hot ? 'text-primary' : ''}`}>{item.value}</span>
        </span>
      ))}
    </div>
  )
}
