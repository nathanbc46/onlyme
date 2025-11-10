import { z } from 'zod'

const orderSchema = z.object({
    customerId: z.string(),
    items: z.array(z.object({
        id: z.string(),  // productId
        price: z.coerce.number().nonnegative(),
        cost: z.coerce.number().nonnegative(),
        qty: z.coerce.number().nonnegative(),
        note: z.string().optional()
    })),
    note: z.string().optional(),
    total: z.coerce.number().nonnegative(),
    totalCost: z.coerce.number().nonnegative()
});


export default defineEventHandler(async (event) => {
    const user = await getCurrentUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const body = await readBody(event)

    const parsed = await orderSchema.safeParseAsync(body)
    if (!parsed.success) {
        console.log(parsed.error)
        throw createError({
            statusCode: 400,
            statusMessage:
                parsed.error.message
        })
    }
    // ดึง id จาก URL เช่น /api/orders/123
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ต้องระบุ id ของคําสั่งซื้อ' })
    }
    try {
        const order = await prisma.order.update({
            where: {
                id: id
            },
            data: {
                customerId: parsed.data.customerId,
                orderItems: {
                    deleteMany: {},
                    create: parsed.data.items.map(item => ({
                        productId: item.id,  // ✅ ชื่อ field ตาม schema
                        quantity: item.qty,  // ✅ ชื่อ field ตาม schema
                        price: item.price,
                        total: item.price * item.qty,
                        cost: item.cost,
                        totalItemCost: item.cost * item.qty,
                        remark: item.note
                    }))
                },
                remark: parsed.data.note,
                totalAmount: parsed.data.total,
                totalCost: parsed.data.totalCost
            },
            include: {
                customer: true,
                orderItems: { include: { product: true } }
            }
        });
        return { data: order };
    } catch (error) {
        console.log(error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error'
        })
    }

})