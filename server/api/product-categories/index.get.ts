import { Prisma } from "@prisma/client";
export default defineEventHandler(async (event) => {
  try {
    const { k, active } = getQuery(event);

    const where: Prisma.ProductCategoryWhereInput = {
      ...(typeof k === "string" &&
        k.trim() !== "" && {
          OR: [
            {
              name: {
                contains: k,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }),

      ...(typeof active === "string" &&
        active.trim() !== "" && {
          active: active === "true",
        }),
    };

    const productCategories = await prisma.productCategory.findMany({
      where: where,
      orderBy: {
        name: "asc",
      },
    });
    return productCategories;
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message,
    });
  }
});
