export default eventHandler(async (event) => {
    // ดึง id จาก URL เช่น /api/products/123
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ต้องระบุ id ของสินค้า' })
    }
    try {
        const order = await prisma.order.delete({
            where: {
                id: id
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