<script lang="ts" setup>

interface Order {
  id?: string
  orderNumber: string
  totalAmount: number | string
  totalCost: number | string | null
  status: string
  remark?: string | null
  customer: {
    id: string
    name: string
  }
  orderItems: {
    id: string
    quantity: number | string
    price: number | string
    remark?: string | null
    product: {
      id: string
      name: string
      image?: string | null
      cost: number | string | null
    }
  }[]
}

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  description?: string
  orders: Order[]
}

defineProps<{ customer: Customer }>()

// const emit = defineEmits<{
//   (e: "add-item", payload: { productId: string; qty: number }): void
// }>()
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
 addItem: [item : CartItemHistory]
}>()

const addItemToCart = (item: CartItemHistory) => {
  emit("addItem", item)
}

// ⭐ Reorder ทั้งออเดอร์
const reorderWholeOrder = (order: Order) => {
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
  //emit("reorder-all", order)
}

// -----------------------------
// GROUP: เมนูซื้อบ่อย
// -----------------------------
// const frequentItems = computed(() => {
//   const map = new Map<string, { name: string; count: number; productId: string }>()

//   props.customer.orders.forEach(order => {
//     order.orderItems.forEach(item => {
//       const key = item.product.id
//       if (!map.has(key)) {
//         map.set(key, {
//           name: item.product.name,
//           count: 0,
//           productId: key
//         })
//       }
//       map.get(key)!.count += Number(item.quantity)
//     })
//   })

//   return Array.from(map.values())
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 4) // top 4
// })

// // -----------------------------
// // GROUP: เมนูแบบเดิม (repeat menu)
// // -----------------------------
// const repeatedMenus = computed(() => {
//   const info = new Map<string, number>()

//   props.customer.orders.forEach(order => {
//     order.orderItems.forEach(item => {
//       const id = item.product.id
//       info.set(id, (info.get(id) || 0) + 1)
//     })
//   })

//   return props.customer.orders
//     .flatMap(o => o.orderItems)
//     .filter(item => (info.get(item.product.id) || 0) > 1)
//     .slice(0, 4)
// })
</script>

<template>
  <div
    class="space-y-6 overflow-y-auto pr-2"
    style="max-height: calc(100vh - 140px);"
  >
    <!-- TITLE -->
    <!-- <h2 class="text-xl font-bold">ประวัติการซื้อ (Timeline)</h2> -->

    <!-- GROUP: ซื้่อบ่อย -->
    <!-- <div>
      <h3 class="font-semibold text-lg mb-2">เมนูที่ซื้อบ่อย</h3>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="item in frequentItems"
          :key="item.productId"
          class="p-3 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100"
          @click="addItemToCart(item.productId, 1)"
        >
          <p class="font-medium">{{ item.name }}</p>
          <p class="text-sm text-gray-500">รวม {{ item.count }} ครั้ง</p>
        </div>
      </div>
    </div> -->

    <!-- GROUP: เมนูแบบเดิม -->
    <!-- <div>
      <h3 class="font-semibold text-lg mb-2">เมนูเดิมที่เคยสั่ง</h3>
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="item in repeatedMenus"
          :key="item.id"
          class="p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100"
          @click="addItemToCart(item.product.id, 1)"
        >
          <p class="font-medium">{{ item.product.name }}</p>
        </div>
      </div>
    </div> -->

    <!-- TIMELINE ORDER HISTORY -->
    <div class="space-y-8">
      <div
        v-for="order in customer.orders"
        :key="order.id"
        class="relative"
      >
        <!-- timeline dot -->
        <!-- <div class="absolute left-0 top-2 w-3 h-3 bg-primary rounded-full"></div> -->

        <!-- Order Card -->
        <UCard variant="subtle">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <span>
              #{{ order.orderNumber }}
            </span>

            <span class="text-success font-bold">
              ฿{{ order.totalAmount }}
            </span>

            <!-- ⭐ REORDER BUTTON -->
              <UButton 
                size="xs" 
                variant="soft" 
                color="success"
                 @click="reorderWholeOrder(order)">
                สั่งออเดอร์นี้อีกครั้ง
              </UButton>
          </div>
        </template>


         
          <div class="grid grid-cols-2 gap-3">
            <!-- PRODUCT ITEMS -->
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
                />
                <span v-else class="text-xs">🍽️</span>
              </div>

              <div class="flex-1">
                <p class="font-medium leading-tight text-gray-900 dark:text-gray-100">
                  {{ item.product.name }}
                  <span v-if="item.remark" class="text-xs text-gray-600 dark:text-gray-300">
                    ({{ item.remark }})
                  </span>
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  x{{ item.quantity }} • ฿{{ item.price }}
                </p>
              </div>
            </div>
          </div>
           <template v-if="order.remark" #footer> 
              <p class="text-xs"><UIcon name="i-lucide-scroll-text" /> {{ order.remark }}</p>
           </template>
          
        </UCard>


      </div>
    </div>
  </div>
</template>
