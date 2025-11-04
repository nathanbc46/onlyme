export default defineEventHandler(async () => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: 'desc'
      }
    });
    return customers;
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message
    })
  }
});