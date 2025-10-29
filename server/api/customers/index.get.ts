export default defineEventHandler(async () => {
  try {
    const customers = await prisma.customer.findMany();
    return customers;
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message
    })
  }
});