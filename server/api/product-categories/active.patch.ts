export default defineEventHandler(async (event) => {
    const { id, active } = await readBody(event)

    const productCategory = await prisma.productCategory.update({
        where: {
            id
        },
        data: {
            active
        }})
    return { data : productCategory }
})