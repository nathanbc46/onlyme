export default defineEventHandler(async () => {
  try {
    // 1️⃣ ดึงลูกค้าทั้งหมด
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        createdAt: true,
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    // 2️⃣ สร้าง array รวม orderCount และ totalSales
    const result = customers.map(c => {
      const orderCount = c.orders.length;
      const totalSales = c.orders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0
      );

      return {
        id: c.id,
        name: c.name,
        email: c.email ?? '',
        description: c.description ?? '',
        createdAt: c.createdAt,
        orderCount,
        totalSales,
      };
    });

    // 3️⃣ เรียงตาม createdAt ล่าสุด
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { data: result };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message,
    });
  }
});
