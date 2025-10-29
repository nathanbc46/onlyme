import { z } from 'zod'

const schema = z.object({
    name: z.string().min(2, 'Too short'),
    email: z.email('Invalid email').optional(),
    phone: z.string().optional(),
    address: z.string().optional()
})

export default defineEventHandler(async (event) => {

    const user = await getCurrentUser(event);
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

        const customer = await prisma.customer.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                phone: parsed.data.phone,
                address: parsed.data.address,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })

        return customer

    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
});