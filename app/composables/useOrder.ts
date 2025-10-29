interface order {
    customerId: string;
    items: {
        id: string;
        name: string;
        price: number;
        qty: number;
        note?: string | undefined;
        _uid?: number | undefined;
    }[];
    note: string;
    total: number;
}

export function useOrder() {
    async function createOrder(orderData: order) {
        try {
            const order = await $fetch('/api/orders', {
                method: 'POST',
                body: orderData,
            })
            return order
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    return {
        createOrder
    }
}