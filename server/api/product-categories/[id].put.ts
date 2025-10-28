import { validateProductCategory } from '~/utils/validateProductCategory'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        // ดึง id จาก URL เช่น /api/products/123
        const id = getRouterParam(event, 'id')
        if (!id) {
            throw createError({ statusCode: 400, message: 'ต้องระบุ id กลุ่มของสินค้า' })
        }

       const data = validateProductCategory(body)

        const productCategory = await prisma.productCategory.update({
            where: {
                id: id
            },
            data: data
        })
        return { data: productCategory }
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})