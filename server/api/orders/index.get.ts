export default defineEventHandler(async (event) => {
    try {
        // const orders = await prisma.order.findMany({
        //     orderBy: {
        //         createdAt: 'desc'
        //     },
        //     include: {
        //         customer: true,
        //         orderItems: {
        //             include: {
        //                 product: true
        //         }}
        //     }
        // });
        // return orders;
        const query = getQuery(event)

        const page = Number(query.page) || 1
        const pageSize = Number(query.pageSize) || 5
        const search = String(query.search) || ''
        const skip = (page - 1) * pageSize

        const where =
            typeof search === 'string' && search.trim() !== ''
                ? {
                    OR: [
                        {
                            orderNumber: {
                                contains: search,
                                mode: 'insensitive' as const, // ✅ บังคับ literal type
                            },
                        },
                        {
                            remark: {
                                contains: search,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            customer: {
                                name: {
                                    contains: search,
                                    mode: 'insensitive' as const,
                                },
                            },
                        },
                        {
                            orderItems: {
                                some: {
                                    product: {
                                        name: {
                                            contains: search,
                                            mode: 'insensitive' as const,
                                        },
                                    },
                                },
                            },
                        },
                    ],
                }
                : undefined

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                skip,
                take: pageSize,
                include: {
                    customer: true,
                    orderItems: {
                        include: {
                            product: true
                        }
                    }
                },
                where,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.order.count({ where })
        ])

        return {
            data: orders,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        }

    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})