<script lang="ts" setup>
const { getOrders } = useOrder()

interface Order {
  id: string
  orderNumber: string
  totalAmount: number | string
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

const orders = ref<Order[]>([])

async function fetchOrders() {
  try {
    orders.value = await getOrders()
    console.log(orders.value)
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <UDashboardPanel id="reports">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Reports Page">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>
      <h1 class="text-2xl font-semibold">Comming Soon</h1>
      <!-- Content for Page goes here -->
      <div v-for="order in orders" :key="order.id" class="mb-4 p-4 border rounded">
        <h2 class="text-lg font-medium">Order #: {{ order.orderNumber }}</h2>
        <p>customer: {{ order.customer.name }}</p>
        <p>Order Items:
          <ul class="list-disc pl-4 ml-4">
            <li v-for="item in order.orderItems" :key="item.id">
              {{ item.product.name }} ({{ item.price }} x {{ item.quantity }}) = ฿{{ Number(item.price) * Number(item.quantity) }}
            </li>
          </ul>
        </p>
        <p>Total Amount: {{ order.totalAmount }}</p>
        <p>Status: {{ order.status }}</p>
      </div>
    </template>
  </UDashboardPanel>
</template>