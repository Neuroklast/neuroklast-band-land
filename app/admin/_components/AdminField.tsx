import type { ReactNode } from 'react'

export function AdminField({
  id,
  label,
  children,
  labelClassName = 'mb-1 block text-sm text-zinc-300',
}: {
  id: string
  label: string
  children: ReactNode
  labelClassName?: string
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      {children}
    </div>
  )
}
