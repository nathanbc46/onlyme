import { z } from 'zod';

const orderSchema = z.object({
    customerId: z.string(),
    items: z.array(z.object({
        id: z.string(),  // productId
        price: z.coerce.number().nonnegative(),
        qty: z.coerce.number().nonnegative(),
        note: z.string().optional()
    })),
    note: z.string().optional(),
    total: z.coerce.number().nonnegative(),
});

export default defineEventHandler(async (event) => {

    const user = await getCurrentUser(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }

    const body = await readBody(event);
    const parseResult = orderSchema.safeParse(body);

    if (!parseResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid order data: " + parseResult.error.message,
            data: parseResult.error.issues
        });
    }

    const newOrder = await prisma.order.create({
        data: {
            orderNumber: `ORD-${Date.now()}`,
            customerId: parseResult.data.customerId,
            remark: parseResult.data.note,
            totalAmount: parseResult.data.total,
            userId: user.id, // ✅ ใช้แค่ userId
            orderItems: {
                create: parseResult.data.items.map(item => ({
                    productId: item.id,  // ✅ ชื่อ field ตาม schema
                    quantity: item.qty,  // ✅ ชื่อ field ตาม schema
                    price: item.price,
                    remark: item.note
                }))
            }
        },
        include: {
            orderItems: true, // คืนข้อมูล orderItems ด้วย
        }
    });

    return newOrder;
});
