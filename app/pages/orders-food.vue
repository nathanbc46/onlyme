<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { SelectMenuItem } from '@nuxt/ui'

const { getProducts } = useProduct()
const { createCustomer } = useCustomer()
const { createOrder } = useOrder()
const { start, finish } = useLoadingIndicator()

const toast = useToast()

// --- ลูกค้า ---
// const selectedCustomerId = ref<string | null>(null)
const selectedCustomerId = ref<string>('')
const addingNewCustomer = ref(false)
const newCustomerName = ref('')
const { data: customers, refresh } = await useFetch<{ id: string; name: string }[]>('/api/customers')

const customerOptions = computed(() =>
  (customers.value || []).map(c => ({ label: c.name, value: c.id }))
)

function searchCustomer(q: string) {
  if (!q) return
  customers.value = customers.value?.filter(c => c.name.includes(q))
}

// เพิ่มลูกค้าใหม่
const loadingAddCustomer = ref(false)
async function addCustomer() {
  if (!newCustomerName.value.trim()) return

  try {
    loadingAddCustomer.value = true
    const newCustomer = { name: newCustomerName.value.trim() }
    const newCustomerData = await createCustomer(newCustomer)
    console.log('newCustomerData', newCustomerData)

    await refresh()

    selectedCustomerId.value = newCustomerData.id
    addingNewCustomer.value = false
    newCustomerName.value = ''
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า (ชื่ออาจซ้ำ): ' + (error as Error).message,
      color: 'error'
    })
    return
  }
  finally {
    loadingAddCustomer.value = false
  }
}

// --- เมนูอาหาร ---
const search = ref('')
interface Products {
  id: string
  name: string
  price: number
  category: {
    id: string
    name: string
  }
  image?: string
}

const data = ref<Products[]>([])
const categories = ref<SelectMenuItem[]>([])
const category = ref('all') // ค่าเริ่มต้นคือ 'all'

// ดึงข้อมูลหมวดหมู่จาก API
const { data: categoriesData } = await useFetch<{ id: string; name: string }[]>('/api/product-categories?k=')
if (categoriesData.value) {
  categories.value = [
    { label: 'All', value: 'all' },
    ...categoriesData.value.map((cat) => ({
      label: cat.name,
      value: cat.name
    }))
  ]
}

// ดึงข้อมูลสินค้า
try {
  start({ force: true })
  const products = await getProducts()
  if (Array.isArray(products)) {
    data.value = products
  } else {
    data.value = [] // fallback
  }
} catch (err) {
  console.error(err)
} finally {
  finish()
}

// กรองข้อมูลตามการค้นหาและหมวดหมู่
const filteredData = computed(() => {
  if (category.value === 'all') {
    return data.value.filter(
      (product) => product.name.toLowerCase().includes(search.value.toLowerCase())
    )
  } else {
    return data.value.filter(
      (product) => product.category.name === category.value && product.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }
})

// --- ตะกร้า ---
interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  note?: string
  _uid?: number
}

const cart = ref<CartItem[]>([])
let uidCounter = 0
const highlightItem = ref<number | null>(null)
const cartWrapper = ref<HTMLElement | null>(null)

function highlight(uid: number) {
  highlightItem.value = uid
  setTimeout(() => (highlightItem.value = null), 500)
}

function addToCart(item: CartItem) {
  const existing = cart.value.find(i => i.id === item.id)
  if (existing) {
    existing.qty++
    highlight(existing._uid!)
  } else {
    const newItem = { ...item, qty: 1, _uid: uidCounter++ }
    cart.value.push(newItem)
    highlight(newItem._uid!)
  }

  nextTick(() => {
    if (cartWrapper.value) cartWrapper.value.scrollTop = cartWrapper.value.scrollHeight
  })
}

function removeFromCart(index: number) {
  const uid = cart?.value[index]?._uid
  cart.value.splice(index, 1)
  if (uid) highlight(uid)
}

function increaseQty(index: number) {
  if (cart.value[index]) {
    cart.value[index].qty++
    highlight(cart.value[index]._uid!)
  }
}

function decreaseQty(index: number) {
  if (cart.value[index]) {
    if (cart.value[index].qty > 1) {
      cart.value[index].qty--
      highlight(cart.value[index]._uid!)
    }
  }
}

const orderNote = ref('')
const totalPrice = computed(() =>
  cart.value.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0)
)

const loadingSubmit = ref(false)
async function submitOrder() {
  if (cart.value.length === 0) {
    toast.add({
      title: 'Error',
      description: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการในตะกร้า',
      color: 'error'
    })
    return
  }
  if (!selectedCustomerId.value) {
    toast.add({
      title: 'Error',
      description: 'กรุณาเลือกลูกค้า',
      color: 'error'
    })
    return
  }

  const order = {
    customerId: selectedCustomerId.value,
    items: cart.value,
    note: orderNote.value,
    total: totalPrice.value
  }

  try {
    loadingSubmit.value = true
    const res = await createOrder(order)
    console.log(res.orderNumber)
    toast.add({
      title: 'Success',
      description: 'สั่งอาหารเรียบร้อยแล้ว! เลขที่คําสั่งซื้อ: ' + res.orderNumber + ' ยอดรวม: ' + (totalPrice.value ? ' ฿' + totalPrice.value.toFixed(2) : ''),
      icon: 'i-heroicons-check-circle',
      color: 'success'
    })

    if (!res || !res.id) {
      throw new Error('Invalid order response from server')
    }

    if (res && res.id) {
      cart.value = []
      orderNote.value = ''
      selectedCustomerId.value = ''

      currentOrder.value = res
      showReceipt.value = true
    }

  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ: ' + (error as Error).message,
      color: 'error'
    })
  } finally {
    loadingSubmit.value = false
  }

}



// --- ใบเสร็จ ---
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
const showReceipt = ref(false)
const currentOrder = ref<Order>()

// async function confirmOrder() {
//   // 1) create order on server
//   const res = await $fetch('/api/orders', { method: 'POST', body: { /* order payload */ } })
//   currentOrder.value = res
//   // 2) open modal
//   showReceipt.value = true
// }

function handleEdit(order: Order) {
  console.log('handleEdit',order)
  return
  // Option A: navigate to edit page
  // navigateTo(`/orders/${order.id}/edit`)
  // Option B: open inline edit modal in same page
}

function onPrinted(orderId: string) {
  console.log('onPrinted', orderId)
  return 
  // optional: mark printed status on server
  // $fetch(`/api/orders/${orderId}/printed`, { method: 'POST' }).catch(() => { })
}

</script>

<template>
  <UDashboardPanel id="orders-food">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Order Food">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>
      <div class="flex flex-col lg:grid lg:grid-cols-2 h-full overflow-hidden">

        <!-- 🍛 เมนูอาหาร -->
        <div class="flex flex-col p-1 h-full overflow-hidden">
          <!-- Search & Filter -->
              <div class="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center">
                <!-- กล่องรวมช่องค้นหา + หมวดหมู่ + ปุ่มเคลียร์ -->
                <div class="flex flex-row gap-2 w-full">
                  <!-- ช่องค้นหา -->
                  <UInput 
                    v-model="search"
                    icon="i-heroicons-magnifying-glass"
                    placeholder="ค้นหาอาหาร..."
                    autofocus
                    class="flex-1"
                    :ui="{ trailing: 'pe-1' }"
                  >
                    <template v-if="search?.length" #trailing>
                      <UButton 
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-circle-x"
                        aria-label="Clear input"
                        @click="search = ''"
                      />
                    </template>
                  </UInput>

                  <!-- ช่องเลือกหมวดหมู่ -->
                  <USelectMenu
                    v-model="category"
                    value-key="value"
                    :items="categories"
                    class="w-32 sm:w-48"
                  />

                  <!-- ปุ่มเคลียร์ -->
                  <UButton 
                    color="neutral"
                    variant="outline"
                    size="sm"
                    icon="i-heroicons-arrow-path"
                    label="เคลียร์"
                    class="hidden sm:inline-flex sm:w-auto"
                    @click="search = ''; category = 'all'"
                  />
                </div>
              </div>


          <!-- Menu Cards -->
          <div
            class="flex flex-col border-b lg:border-r border-gray-200 dark:border-gray-700 p-2 sm:p-4 overflow-y-auto h-full">
            <div v-if="filteredData.length === 0" class="text-center text-gray-500 italic mt-10">
              ไม่พบเมนูอาหาร
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3 pb-6">
              <UCard 
              v-for="item in filteredData" :key="item.id" :title="item.name"
                class="flex flex-col bg-gray-50 dark:bg-gray-800 cursor-pointer hover:shadow-lg dark:hover:shadow-primary/30 transition-shadow duration-200 h-auto gap-3"
                @click="addToCart({ ...item, qty: 1 })">
                <img v-if="item.image" :src="item.image" class="rounded-lg aspect-square object-cover" >
                <div class="mt-2 font-semibold truncate text-sm sm:text-base">{{ item.name }}</div>
                <div class="flex-1 text-xs sm:text-sm">{{ item.category.name }}</div>
                <div class="text-gray-500 text-sm sm:text-base">฿{{ item.price ?? 0 }}</div>
              </UCard>
            </div>
          </div>
        </div>

        <!-- 🧺 ตะกร้าสั่งซื้อ -->
        <div class="flex flex-col h-full overflow-hidden">
          <div class="flex-1 flex flex-col p-2 sm:p-4 overflow-y-auto min-h-0">
            <h2 class="hidden sm:inline-flex sm:w-auto text-lg font-bold mb-3 items-center gap-2">
              <UIcon name="i-heroicons-shopping-bag" /> ตะกร้าสั่งซื้อ
            </h2>

            <!-- ลูกค้า -->
            <div class="rounded-xl p-2 mb-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2 shadow-sm">

              <!-- กลุ่มซ้าย: label + select + ปุ่มเพิ่ม -->
              <div class="flex flex-row flex-wrap items-center gap-2 w-full">
                <!-- Label -->
                <label class="hidden sm:inline-flex sm:w-auto items-center gap-2 whitespace-nowrap">
                  <UIcon name="i-heroicons-user" /> ลูกค้า
                </label>

                <!-- Select ลูกค้า -->
                <USelectMenu 
                  v-model="selectedCustomerId"
                  :items="customerOptions"
                  value-key="value"
                  placeholder="เลือกลูกค้า"
                  searchable
                  :searchable-placeholder="'พิมพ์เพื่อค้นหา'"
                  class="flex-1 min-w-[140px] sm:w-1/3"
                  @search="searchCustomer"
                />

                <!-- ปุ่มเพิ่มลูกค้าใหม่ -->
                <UButton
                  v-if="!addingNewCustomer"
                  variant="link"
                  class="whitespace-nowrap"
                  @click="addingNewCustomer = !addingNewCustomer"
                >
                  {{ addingNewCustomer ? 'ยกเลิก' : '+ เพิ่มลูกค้าใหม่' }}
                </UButton>
              </div>

              <!-- ฟอร์มเพิ่มลูกค้าใหม่ -->
              <div v-if="addingNewCustomer" class="w-full">
                <UForm class="flex flex-col sm:flex-row gap-2 items-center w-full" @submit="addCustomer">
                  <UInput 
                    v-model="newCustomerName"
                    autofocus
                    placeholder="ชื่อลูกค้าใหม่"
                    class="flex-1 w-full sm:w-auto"
                  />
                  <UButton
                    type="submit"
                    :loading="loadingAddCustomer"
                    color="primary"
                    class="w-full sm:w-auto"
                  >
                    บันทึก
                  </UButton>
                  <UButton
                    variant="link"
                    class="w-full sm:w-auto"
                    @click="addingNewCustomer = false"
                  >
                    ยกเลิก
                  </UButton>
                </UForm>
              </div>
            </div>


            <!-- รายการสินค้าในตะกร้า -->
            <div ref="cartWrapper" class="flex-1 overflow-y-auto space-y-4 min-h-0">
              <transition-group name="cart" tag="div">
                <div v-if="cart.length === 0" key="empty" class="text-center text-gray-500 italic mt-10">
                  ตะกร้าว่างเปล่า<br>กรุณาเลือกสินค้าเพื่อเพิ่มลงในตะกร้า
                </div>

                <div v-else>
                <div 
                  v-for="(item, index) in cart" :key="item._uid"
                  class="border border-gray-300 dark:border-gray-700 rounded-xl p-0 sm:p-2 shadow-sm hover:shadow-md transition-all bg-gray-50 dark:bg-gray-800 mb-2"
                  :class="{ 'bg-yellow-100 dark:bg-yellow-700': highlightItem === item._uid }">
                  <!-- ส่วนหัว -->
                  <div class="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                    <div class="col-span-4 font-semibold truncate text-sm sm:text-base">
                      <UBadge variant="subtle">{{ index + 1 }}</UBadge> {{ item.name }}
                    </div>
                    <div class="col-span-5">
                      <UInput 
                        v-model="item.note" placeholder="เช่น 'พิเศษ ไม่เผ็ด'" size="sm"
                        icon="i-lucide-message-square-text" class="w-full text-sm sm:text-base" />
                    </div>
                    <div class="col-span-3 text-right">
                      <UButton 
                        icon="i-heroicons-trash" color="error" variant="ghost" size="sm"
                        @click="removeFromCart(index)" />
                    </div>
                  </div>

                  <!-- ส่วนรายละเอียด -->
                  <div class="grid grid-cols-12 gap-2 sm:gap-3 items-center mt-2">
                    <div class="col-span-4 flex items-center gap-2 text-sm sm:text-base">
                      <span class="text-gray-500">ราคา:</span>
                      <UInput v-model.number="item.price" type="number" size="sm" step="10" class="w-20" />
                    </div>
                    <div class="col-span-5 flex items-center justify-center gap-2">
                      <UButton 
                        icon="i-heroicons-minus" size="sm" color="neutral" variant="ghost"
                        @click="decreaseQty(index)" />
                      <UBadge v-if="item.qty > 1" color="error" variant="subtle">{{ item.qty }}</UBadge>
                      <span v-else class="w-6 text-xs sm:text-sm text-center">{{ item.qty }}</span>
                      <UButton 
                        icon="i-heroicons-plus" size="sm" color="neutral" variant="ghost"
                        @click="increaseQty(index)" />
                    </div>
                    <div
                      class="col-span-3 text-right font-semibold text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      ฿{{ ((item.price || 0) * (item.qty || 0)).toFixed(2) }}
                    </div>
                  </div>
                </div>
                </div>

              </transition-group>
            </div>
          </div>

          <!-- 🔹 สรุปออเดอร์ (sticky ด้านล่าง) -->
          <div
            class="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 sticky bottom-0 z-10 space-y-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] bg-white dark:bg-gray-900">
            <UTextarea
               v-model="orderNote" :rows="1" class="w-full text-sm sm:text-base" icon="i-lucide-scroll-text"
              placeholder="รายละเอียดเพิ่มเติมของทั้งออเดอร์ เช่น 'แยกถุง', 'ส่งก่อนเที่ยง'" />
            <div class="flex justify-between items-center font-semibold text-base sm:text-lg">
              <div>รวมทั้งหมด: ({{ cart.length }} รายการ)</div>
              <div>฿{{ totalPrice.toFixed(2) }}</div>
            </div>
            <div class="w-full flex gap-4">
              <UButton class="flex-1" color="neutral" block @click="cart = []; orderNote = ''">
                <UIcon name="i-lucide-brush-cleaning" /> ล้างตะกร้า
              </UButton>
              <UButton 
                :disabled="cart.length === 0 || selectedCustomerId.valueOf() === ''" class="flex-2"
                :loading="loadingSubmit"
                color="success" block @click="submitOrder">
                <UIcon name="i-heroicons-check-circle" /> ยืนยันคำสั่งซื้อ
              </UButton>

              <OrderReceiptModal 
                v-if="showReceipt && currentOrder" :model-value="showReceipt" :order="currentOrder"
                @close="showReceipt = false"
                @edit="handleEdit" 
                @printed="onPrinted" />

            </div>

          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>




<style scoped>
/* Animation เพิ่ม/ลบสินค้า */
.cart-enter-from,
.cart-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.cart-enter-to,
.cart-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.cart-enter-active,
.cart-leave-active {
  transition: all 0.3s ease;
}

/* Highlight สี */
.bg-yellow-100 {
  transition: background-color 0.5s ease;
}
</style>
