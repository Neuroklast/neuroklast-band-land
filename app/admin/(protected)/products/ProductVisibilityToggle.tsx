'use client'

import { toggleProductVisibility } from '@/app/admin/_actions/products'
import { AdminVisibilityToggle } from '@/app/admin/_components/AdminVisibilityToggle'

interface ProductVisibilityToggleProps {
  productId: string
  active: boolean
}

export function ProductVisibilityToggle({ productId, active }: ProductVisibilityToggleProps) {
  return (
    <AdminVisibilityToggle
      id={productId}
      initialActive={active}
      onToggle={toggleProductVisibility}
      hideLabel="Hide product on site"
      showLabel="Show product on site"
    />
  )
}
