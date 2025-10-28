import { Prisma } from '@prisma/client'
export default defineEventHandler(async (event) => {
    try {
        const { k } = getQuery(event)

        const where =
            typeof k === 'string' && k.trim() !== ''
                ? {
                    OR: [
                        {
                            name: {
                                contains: k,
                                mode: Prisma.QueryMode.insensitive, 
                            },
                        },
                        {
                            category: {
                                name: {
                                    contains: k,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    ],
                }
                : undefined

        const products = await prisma.product.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
            include: {
                category: true,
            },
        })
        return products
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})