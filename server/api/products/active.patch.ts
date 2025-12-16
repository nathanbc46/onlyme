export default defineEventHandler(async (event) => {
    const { id, active } = await readBody(event)

    const product = await prisma.product.update({
        where: {
            id
        },
        data: {
            active
        },
        include: {
            category: true
        }
    })
    return { data : product }
})