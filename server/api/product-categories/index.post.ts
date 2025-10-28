import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    userId: z.string().optional()
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

    try {
        const productCategory = await prisma.productCategory.create({
            data: {
                name: parsed.data.name,
                userId: user.id
            }
        })
        return productCategory
    } catch (error) {
       throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})