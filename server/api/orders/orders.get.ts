export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const limit = Number(query.limit || 10)
  const cursorId = query.cursor ? String(query.cursor) : null

  const data = await prisma.order.findMany({
    where: {
      customerId: String(query.customerId)
    },
    take: limit + 1,
    ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" }          // ⭐ ต้องใส่อันนี้เพื่อให้ cursor ใช้ id ได้
    ],
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  })

  let nextCursor = null
  if (data.length > limit) {
    nextCursor = data[limit].id     // ⭐ ใช้ id เป็น cursor
    data.pop()
  }

  return { data, nextCursor }
})
