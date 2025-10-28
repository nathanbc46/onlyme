import { Prisma } from '@prisma/client'
export default defineEventHandler(async (event) => {
    try {
        const { k } = getQuery(event)

        const where =
            typeof k === 'string' && k.trim() !== ''
                ? {
                    name: {
                        contains: k,
                        mode: Prisma.QueryMode.insensitive, // ✅ ต้องแบบนี้เท่านั้น
                    },
                }
                : undefined

        const productCategories = await prisma.productCategory.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
        })
        return productCategories
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})