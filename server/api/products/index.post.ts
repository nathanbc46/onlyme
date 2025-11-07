import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    categoryId: z.string().optional(),
    price: z.number().min(0),
    cost: z.number().min(0),
    image: z.string().optional()
})

export default defineEventHandler(async (event) => {
    const user = await getCurrentUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }
    try {
        const body = await readBody(event)

        const parsed = await schema.safeParseAsync(body)
        if (!parsed.success) {
            console.log(parsed.error)
            throw createError({
                statusCode: 400,
                statusMessage:
                    parsed.error.message
            })
        }
        const products = await prisma.product.create({
            data: {
                name: parsed.data.name,
                image: parsed.data.image,
                category: {
                    connect: {
                        id: parsed.data.categoryId
                    }
                },
                user: {
                    connect: {
                        id: user.id
                    }
                },
                price: parsed.data.price,
                cost: parsed.data.cost
            },
            include: {
                category: true
            }
        })
        return products
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})