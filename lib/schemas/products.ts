import { z } from 'zod'

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageStoragePath: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  priceLabel: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  active: z.boolean().default(true),
})

export type Product = z.infer<typeof productSchema>
