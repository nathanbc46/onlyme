export default defineEventHandler(async () => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: 'desc'
      }
    });
    return customers;
    // const customers = await prisma.customer.findMany({
    //   include: {
    //     orders: {
    //       orderBy: { createdAt: 'desc' },
    //       take: 5,
    //       include: {
    //         orderItems: {
    //           include: {
    //             product: true, // ดึงชื่อสินค้า ราคา เดิมทั้งหมด
    //           },
    //         },
    //         customer: true, // ถ้าต้องการข้อมูลลูกค้าใน order ซ้ำ (ลบออกได้)
    //       },
    //     },
    //   },
    // });


    // return customers

  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message
    })
  }
});