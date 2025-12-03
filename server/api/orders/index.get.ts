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
        const sortBy = String(query.sortBy) || 'createdAt'
        const sortOrder = (query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
        const skip = (page - 1) * pageSize

        // Map frontend column names to Prisma orderBy
        const sortFieldMap: Record<string, any> = {
            'orderNumber': { orderNumber: sortOrder },
            'status': { status: sortOrder },
            'customer': { customer: { name: sortOrder } },
            'totalAmount': { totalAmount: sortOrder },
            'totalCost': { totalCost: sortOrder },
            'createdAt': { createdAt: sortOrder }
        }

        const orderBy = sortFieldMap[sortBy] || { createdAt: 'desc' }

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
                orderBy
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