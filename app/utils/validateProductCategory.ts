import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    userId: z.string().optional()
})

export type ProductCategory = z.infer<typeof schema>

export function validateProductCategory(productCategory: ProductCategory) {
    const validation = schema.safeParse(productCategory)
    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage:
                validation.error.message
        })
    }

    return validation.data
}