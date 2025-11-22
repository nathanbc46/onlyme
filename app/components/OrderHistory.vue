<script setup lang="ts">
const toast = useToast()

// --------------------------
// PROPS
// --------------------------
const props = defineProps<{
  customerId: string
  customerName: string
}>()

// --------------------------
// TYPES
// --------------------------
interface OrderItemProduct {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  price: string;
  cost: string | null;
  categoryId: string;
  image: string | null;
}

interface OrderItem {
  id: string;
  remark: string | null;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  cost: string | null;
  total: string | null;
  totalItemCost: string | null;
  product: OrderItemProduct;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  remark: string | null;
  totalAmount: string;
  totalCost: string | null;
  orderItems: OrderItem[];
}

// --------------------------
// EMIT
// --------------------------
interface CartItemHistory {
  id: string
  name: string
  price: number
  cost: number
  qty: number
  note?: string | null
  _uid?: number
}

const emit = defineEmits<{
  addItem: [item: CartItemHistory]
  addRemark: [remark: string | null]
}>()

// --------------------------
// STATE
// --------------------------
const orders = ref<Order[]>([])
const cursor = ref<string | null>(null)
const loading = ref(false)
const finished = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)
const bottomTrigger = ref<HTMLElement | null>(null)

// --------------------------
// FETCH ORDERS WITH CURSOR
// --------------------------

const fetchOrders = async () => {
  if (loading.value || finished.value) return
  loading.value = true

  const res = await $fetch("/api/orders/orders", {
    params: {
      customerId: props.customerId,
      cursor: cursor.value,
      limit: 4
    }
  })

  if (res.data.length === 0) {
    finished.value = true
    loading.value = false
    return
  }

  orders.value.push(...res.data)
  cursor.value = res.nextCursor ?? null

  if (!res.nextCursor) finished.value = true

  loading.value = false

  return true   // ⭐ บอกว่าโหลดได้จริง
}

// --------------------------
// ON MOUNT → FETCH + SETUP OBSERVER
// --------------------------

const autoFillScreen = async () => {
  await nextTick()
  const el = scrollContainer.value
  if (!el || finished.value) return

  const notScrollable = el.scrollHeight <= el.clientHeight + 20

  if (notScrollable) {
    const loaded = await fetchOrders()

    // ⭐ ถ้าโหลดไม่สำเร็จ (ไม่มีข้อมูลใหม่) → หยุดทันที
    if (!loaded) return

    // ⭐ ถ้าโหลดเพิ่มได้ → ตรวจอีกครั้ง
    autoFillScreen()
  }
}


onMounted(async () => {
  await fetchOrders()
  autoFillScreen()   // เติมหน้าจอให้พอดี

  const observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      fetchOrders().then((loaded) => {
        if (loaded) autoFillScreen()
      })
    }
  }, {
    root: scrollContainer.value,
    threshold: 0.1
  })

  if (bottomTrigger.value) observer.observe(bottomTrigger.value)
})


// --------------------------
// ACTIONS
// --------------------------
const addItemToCart = (item: CartItemHistory, remark: string = '') => {
  toast.add({
    title: 'Item added to cart',
    color: 'success',
    duration: 500
  })
  emit("addItem", item)
  emit("addRemark", remark)
}

const reorderWholeOrder = (order: Order) => {
  toast.add({
    title: 'Item added to cart',
    color: 'success',
    duration: 500
  })
  order.orderItems.forEach(item => {
    emit("addItem", {
      id: item.product.id,
      note: item.remark,
      name: item.product.name,
      price: Number(item.price),
      cost: Number(item.product.cost),
      qty: Number(item.quantity)
    })
  })
  emit("addRemark", order.remark)
}
</script>

<template ref="scrollContainer">


    <!-- ORDER LIST -->
    <div class="space-y-8">
      <div
        v-for="order in orders"
        :key="order.id"
        class="relative pl-6"
      >
        <UCard variant="subtle">

          <!-- HEADER -->
          <template #header>
            <div class="flex items-center justify-between w-full">

              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-clock-8" />
                {{ formatDateTime(new Date(order.createdAt)) }}
              </span>

              <span class="text-green-600 font-bold">
                ฿{{ order.totalAmount }}
              </span>

              <UButton 
                size="xs" 
                variant="soft" 
                color="primary"
                class="active:scale-95 transition-transform duration-150"
                @click="reorderWholeOrder(order)"
              >
                สั่งออเดอร์นี้อีกครั้ง
              </UButton>
            </div>
          </template>

          <!-- ITEMS -->
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="item in order.orderItems"
              :key="item.id"
              class="
                flex gap-3 
                bg-gray-50 dark:bg-gray-800 
                rounded-xl 
                hover:bg-gray-100 dark:hover:bg-gray-700 
                cursor-pointer transition 
                active:scale-95
              "
              @click="addItemToCart({
                id: item.product.id,
                note: item.remark,
                name: item.product.name,
                price: Number(item.price),
                cost: Number(item.product.cost),
                qty: Number(item.quantity)
              })"
            >

              <!-- ICON -->
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <img
                  v-if="item.product.image"
                  :src="item.product.image"
                  class="w-10 h-10 rounded-full object-cover"
                >
                <span v-else class="text-xs">🍽️</span>
              </div>

              <div class="flex-1">
                <p class="font-medium leading-tight text-gray-900 dark:text-gray-100">
                  {{ item.product.name }}
                </p>
                <p v-if="item.remark" class="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  ({{ item.remark }})
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  x{{ item.quantity }} • ฿{{ item.price }}
                </p>
              </div>

            </div>
          </div>

          <!-- FOOTER -->
          <template v-if="order.remark" #footer>
            <p class="text-xs">
              <UIcon name="i-lucide-scroll-text" /> {{ order.remark }}
            </p>
          </template>

        </UCard>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center text-gray-500 py-3">
      <UIcon name="i-lucide-loader" class="animate-spin" /> กำลังโหลด...
    </div>

    <div v-if="finished" class="text-center text-gray-400 py-3 text-sm">
      ไม่มีข้อมูลเพิ่มเติม
    </div>

    <!-- 🔥 TRIGGER (magic happens here) -->
    <div ref="bottomTrigger" class="h-10" />

  
</template>
