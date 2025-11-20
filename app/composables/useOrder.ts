interface order {
    id?: string;
    customerId: string;
    items: {
        id: string;
        name: string;
        price: number;
        cost: number;
        qty: number;
        note?: string | null;
        _uid?: number | undefined;
    }[];
    note: string;
    total: number;
    totalCost: number;
}

interface OrderDetail {
  id: string
  orderNumber: string
  totalAmount: number | string
  totalCost: number | string | null
  status: string
  customer: {
    id: string
    name: string
  }
  orderItems: {
    id: string
    quantity: number | string
    price: number | string
    product: {
      id: string
      name: string
    }
  }[]
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

    async function updateOrder(id: string, orderData: order) {
        try {
            const order = await $fetch<{data : OrderDetail}>(`/api/orders/${id}`, {
                method: 'PUT',
                body: orderData,
            })
            return order.data
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    async function getOrders() {
        try {
            const orders = await $fetch('/api/orders', {
                method: 'GET',
            })
            return orders
        } catch (error) {
            console.error('Error getting orders:', error);
            throw error;
        }
    }

    async function getOrder(id: string) {
        try {
            const order = await $fetch<{data : OrderDetail}>(`/api/orders/${id}`, {
                method: 'GET',
            })
            return order.data
        } catch (error) {
            console.error('Error getting order:', error);
            throw error;
        }
    }

    async function deleteOrder(id: string) {
        try {
            const order = await $fetch<{data : OrderDetail}>(`/api/orders/${id}`, {
                method: 'DELETE',
            })
            return order.data
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    async function updateOrderStatus(id: string, status: string) {
        try {
            const order = await $fetch<{data : OrderDetail}>(`/api/orders/status`, {
                method: 'PATCH',
                body: { id: id, status }
            })
            return order.data
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    return {
        createOrder,
        getOrders,
        updateOrder,
        getOrder,
        deleteOrder,
        updateOrderStatus
    }
}