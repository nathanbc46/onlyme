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
    // ดึง id จาก URL เช่น /api/products/123
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ต้องระบุ id ของสินค้า' })
    }
    try {
        const product = await prisma.product.update({
            where: {
                id: id
            },
            data: {
                name: body.name,
                categoryId: body.categoryId,
                price: body.price,
                cost: body.cost,
                image: body.image,
                userId: user.id
            },
            include: {
                category: true
            }
        })
        return { data: product }
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})