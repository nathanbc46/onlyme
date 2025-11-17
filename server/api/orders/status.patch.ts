export default eventHandler(async (event) => {
    const body = await readBody(event)
    try {
        const order = await prisma.order.update({
            where: {
                id: body.id
            },
            data: {
                status: body.status
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