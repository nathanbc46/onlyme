import { Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    const { k, active } = getQuery(event);

    const where: Prisma.ProductWhereInput = {
      ...(typeof k === "string" &&
        k.trim() !== "" && {
          OR: [
            {
              name: {
                contains: k,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              category: {
                name: {
                  contains: k,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }),

      ...(typeof active === "string" &&
        active.trim() !== "" && {
          active: active === "true",
        }),
    };

    const products = await prisma.product.findMany({
      where: where,
      orderBy: {
        name: "desc",
      },
      include: {
        category: true,
      },
    });

    return products;
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message,
    });
  }
});
