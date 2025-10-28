export default defineEventHandler(async (event) => {
    // ดึง id จาก URL เช่น /api/products/123
    const id = getRouterParam(event, 'id')
    if (!id) {
        throw createError({ statusCode: 400, message: 'ต้องระบุ id กลุ่มของสินค้า' })
    }
    try {
        const productCategory = await prisma.productCategory.delete({
            where: {
                id: id
            }
        })
        return { data: productCategory }
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})