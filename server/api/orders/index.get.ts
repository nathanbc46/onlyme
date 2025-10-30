export default defineEventHandler(async () => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                customer: true,
                orderItems: {
                    include: {
                        product: true
                }}
            }
        });
        return orders;
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})