export default defineEventHandler(async (event) => {
    // ดึง id จาก URL เช่น /api/orders/123
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ต้องระบุ id ของคําสั่งซื้อ' })
    }
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: id
            },
             include: {
                customer: true,
                orderItems: { include: { product: true } }
            }           
        })
        return { data: order }
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})