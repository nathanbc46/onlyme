<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { SelectMenuItem } from '@nuxt/ui'
import type { Product } from '~/types/product'
import type { Order } from '~/types/order'
import type { Customer } from '~/types/customer'

const { getProducts } = useProduct()
const { createCustomer } = useCustomer()
const { createOrder } = useOrder()
const { start, finish } = useLoadingIndicator()

const { getSalesToday } = useDashboard()

// --- ตะกร้า ---
interface CartItem {
  id: string
  name: string
  price: number
  cost: number
  qty: number
  note?: string | null
  _uid?: number
}

// const route = useRoute()
const toast = useToast()
const showReceipt = ref(false)
const currentOrder = ref<Order>()

// interface Customer extends CustomerType {
//   orders: Order[]
// }

// --- ลูกค้า ---
// const selectedCustomerId = ref<string | null>(null)
const selectedCustomerId = ref<string>('')
const addingNewCustomer = ref(false)
const newCustomerName = ref('')
const selectedCustomer = ref<Customer | null | undefined>(null)


const { data: customers, refresh, status: statusCustomers } = await useFetch<Customer[]>('/api/customers')

// --- ยอดขายวันนี้ ---
const salesToday = await getSalesToday()
//console.log('salesToday', salesToday)

const salesTodayRef = ref<string | number | null>(0)
salesTodayRef.value = salesToday?._sum.totalAmount
//

const customerOptions = computed(() =>
  (customers.value || []).map(c => ({ label: c.name, value: c.id }))
)

function searchCustomer(q: string) {
  if (!q) return
  customers.value = customers.value?.filter(c => c.name.includes(q))
}

function selectCustomer(customerId: string) {
  selectedCustomer.value = customers.value?.find(c => c.id === customerId)
  //get last order of customer
  // const lastOrder = selectedCustomer.value?.orders[selectedCustomer.value?.orders.length - 1]
  // if (lastOrder) {
  //   selectedCustomerId.value = lastOrder.id
  // }
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
    selectCustomer(newCustomerData.id)
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
const data = ref<Product[]>([])
const categories = ref<SelectMenuItem[]>([])
const category = ref('all') // ค่าเริ่มต้นคือ 'all'

// ดึงข้อมูลหมวดหมู่จาก API
const { data: categoriesData, status: statusCategories } = await useFetch<{ id: string; name: string }[]>('/api/product-categories?k=')
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
const loadingProducts = ref(false)
try {
  loadingProducts.value = true
  start({ force: true })
  const products = await getProducts('', 'true')
  if (Array.isArray(products)) {
    data.value = products
  } else {
    data.value = [] // fallback
  }
} catch (err) {
  console.error(err)
} finally {
  loadingProducts.value = false
  finish()
}

const isLoading = computed(() => statusCustomers.value === 'pending' || statusCategories.value === 'pending' || loadingProducts.value)

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
const totalCost = computed(() =>
  cart.value.reduce((sum, i) => sum + (i.cost || 0) * (i.qty || 0), 0)
)

const loadingSubmit = ref(false)
const orderCart = ref<Order | null>()

function confirmOrder() {
  if (cart.value.length === 0) {
    toast.add({
      title: 'Error',
      description: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการในตะกร้า',
      color: 'error'
    })
    return
  }

  showReceipt.value = true

  orderCart.value = {
    orderNumber: '[ORDER NUMBER-->รอยืนยัน]',
    totalAmount: totalPrice.value,
    totalCost: totalCost.value,
    status: '',
    remark: orderNote.value,
    customer: {
      id: selectedCustomerId.value || '',
      name: selectedCustomer.value?.name || ''
    },
    orderItems: cart.value.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: item.price,
      remark: item.note,
      product: {
        id: item.id,
        name: item.name,
        cost: item.cost
      }
    }))
  }

  // console.log('showReceipt',showReceipt.value)
  // console.log('orderCart',orderCart.value)
  
}

function lastOrderPrint() {
  if(currentOrder.value){
    orderCart.value = {
      id: currentOrder.value.id,
      orderNumber: currentOrder.value.orderNumber,
      totalAmount: currentOrder.value.totalAmount,
      totalCost: currentOrder.value.totalCost,
      status: '',
      remark: currentOrder.value.remark,
      customer: {
        id: currentOrder.value.customer.id || '',
        name: currentOrder.value.customer.name || ''
      },
      orderItems: currentOrder.value.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        remark: item.remark,
        product: {
          id: item.product.id,
          name: item.product.name,
          cost: item.product.cost
        }
      }))
    }   
    
    showReceipt.value = true
    console.log('showReceipt',showReceipt.value)
    console.log('orderCart',orderCart.value)
  }

}

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
    total: totalPrice.value,
    totalCost: totalCost.value
  }

  try {
    loadingSubmit.value = true

    //Create Order


      const res = await createOrder(order)
      // console.log(res.orderNumber)
      toast.add({
        title: 'Success',
        description: 'สั่งอาหารเรียบร้อยแล้ว! เลขที่คําสั่งซื้อ: ' + res.orderNumber + ' ยอดรวม: ' + (totalPrice.value ? ' ฿' + totalPrice.value.toFixed(2) : ''),
        icon: 'i-heroicons-check-circle',
        color: 'success'
      })

      salesTodayRef.value = (Number(salesTodayRef?.value ?? 0) + Number(totalPrice.value))

      if (!res || !res.id) {
        throw new Error('Invalid order response from server')
      }      

      if (res && res.id) {
        currentOrder.value = res
        clearCartAndOrder()
        //showReceipt.value = true
       }



  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ: ' + (error as Error).message,
      color: 'error'
    })
  } finally {
    loadingSubmit.value = false
    //showReceipt.value = false; 
  }

}

function clearCartAndOrder() {
  cart.value = []
  orderNote.value = ''
  selectedCustomerId.value = ''
}

/* const tags = ["พิเศษ", "ไม่หวาน", "ไม่ผัก", "ไม่เผ็ด", "แยกน้ำ"]

function appendNote(item : CartItem, text = '') {
  if (!item.note) {
    item.note = text
    return
  }

  // กันการใส่คำซ้ำ
  if (item.note.includes(text)) return

  // ต่อท้ายแบบเว้นวรรคอัตโนมัติ
  item.note = `${item.note} ${text}`.trim()
} */

// Tags หลัก
const tags = ["พิเศษ", "ไม่หวาน","ไม่ผัก","เผ็ดน้อย", "แยกน้ำ", "เพิ่มเส้น"]

// Toggle Tag สำหรับแต่ละ item
function toggleTag(item : CartItem, tag = '') {
  if (!item.note) {
    item.note = tag
    return
  }

  const words = item.note.split(' ')

  if (words.includes(tag)) {
    // ถ้าเคยเลือกแล้ว -> เอาออก
    item.note = words.filter(w => w !== tag).join(' ')
  } else {
    // เพิ่ม tag ใหม่
    item.note = `${item.note} ${tag}`.trim()
  }
}

// Tags หลัก
const tagsNode = ["ไม่รับช้อนซ่อม", "ไม่รับถุงพลาสติก"]

// Toggle Tag สำหรับแต่ละ item
function toggleTagNode(tag = '') {
  if (!orderNote.value) {
    orderNote.value = tag
    return
  }

  const words = orderNote.value.split(' ')

  if (words.includes(tag)) {
    // ถ้าเคยเลือกแล้ว -> เอาออก
    orderNote.value = words.filter(w => w !== tag).join(' ')
  } else {
    // เพิ่ม tag ใหม่
    orderNote.value = `${orderNote.value} ${tag}`.trim()
  }
}


const open = ref(false)
</script>

<template>
  <UDashboardPanel id="orders-food">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Order Food">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
         <UIcon name="i-lucide-trending-up" class="text-2xl" /> ยอดขายวันนี้ :  <UBadge color="success" variant="subtle" size="lg" class="font-semibold">฿{{ Number(salesTodayRef)?.toLocaleString()  ?? 0 }}</UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-full">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary" />
        <span class="mt-2 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
      <div v-else class="flex flex-col lg:grid lg:grid-cols-2 h-full overflow-hidden">

        <!-- 🍛 เมนูอาหาร -->
        <div class="flex flex-col p-1 h-[60%] sm:h-full overflow-hidden">
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

            <div class="hidden sm:flex flex-wrap gap-2 mb-4">
              <UButton 
                v-for="cat in categoriesData"
                  :key="cat.id"
                 
                    :icon="
                    cat.name === 'ยำแซ่บซี๊ด'
                      ? 'i-heroicons-fire'
                      : cat.name === 'ตำตำ'
                        ? 'mdi:chili-mild'
                      : cat.name === 'ข้าวไข่เจียว'
                        ? 'i-lucide-egg'
                      : cat.name === 'ข้าวผัด'
                        ? 'mdi:rice'      
                       : cat.name === 'ต้มแซ่บ'
                        ? 'mdi:pot-steam-outline'     
                       : cat.name === 'ข้าวไก่กรอบ'
                        ? 'mdi:food-drumstick-outline'           
                        : cat.name === 'สปาเก็ตตี้'
                        ? 'mdi:pasta'                                                                                
                      : 'mdi:bowl-mix-outline'
                  "
                  :variant="category === cat.name ? 'solid' : 'outline'"
                  :color="category === cat.name  ? 'primary' : 'neutral'"
                @click="category = cat.name"

              >
                {{ cat.name }}
              </UButton>
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
                class="flex flex-col bg-gray-50 dark:bg-gray-800 cursor-pointer hover:shadow-lg dark:hover:shadow-primary/30 transition-shadow duration-200 h-auto gap-3 hover:z-1"
                @click="addToCart({ ...item, qty: 1 })">
                <img v-if="item.image" :src="item.image" class="rounded-lg aspect-square object-cover" >
                <div class="mt-2 font-semibold truncate text-sm sm:text-base">{{ item.name }}</div>
                <div class="flex-1 text-xs sm:text-sm">{{ item.category.name }}</div>
                <div class="text-gray-500 text-sm sm:text-base"><span class="font-semibold">฿{{ item.price ?? 0 }}</span> <span class="text-xs text-muted italic">({{ item.cost}})</span></div>
              </UCard> 
            </div>
          </div>
        </div>

        <!-- 🧺 ตะกร้าสั่งซื้อ -->
        <div class="flex flex-col h-full overflow-hidden">
          <div class="flex-1 flex flex-col sm:pl-4 overflow-y-auto min-h-0">

           <div class="hidden sm:grid grid-cols-[30%_65%] items-center gap-3">
              <h2 class="hidden sm:inline-flex sm:w-auto text-lg font-bold mb-3 items-center gap-2">
                <UIcon name="i-heroicons-shopping-bag" /> ตะกร้าสั่งซื้อ
              </h2>
              <!-- <span v-if="currentOrder?.id" class="text-info p-2 mb-2 cursor-pointer"  @click="lastOrderPrint">คำสั่งซื้อล่าสุด #{{ currentOrder?.orderNumber }} ({{ currentOrder?.customer.name }})</span> -->
              <UAlert v-if="currentOrder?.id" color="info" icon="i-lucide-info" class="p-2 mb-2 cursor-pointer" variant="subtle" :title="`คำสั่งซื้อล่าสุด #${currentOrder.orderNumber} (${currentOrder.customer.name})` " @click="lastOrderPrint" />

            </div>
            <!-- ลูกค้า -->
            <div class="rounded-xl p-2 mb-4 shrink-0 shadow-sm dark:shadow-primary/30">

              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 ">
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
                    @change="selectCustomer(selectedCustomerId)"
                  />


                <USlideover 
                v-if="selectedCustomer?.name && !addingNewCustomer" 
                v-model:open="open" 
                direction="right" 
                title="ประวัติการซื้อล่าสุด" 
                :description="`ประวัติการซื้อล่าสุดของ ${selectedCustomer.name}`"
                :close="{
                  color: 'primary',
                  variant: 'outline',
                  class: 'rounded-full'
                }"
                >
                  <UButton color="neutral" variant="subtle" trailing-icon="i-lucide-history" />

                  <template #body>
                    <!-- <OrderHistory :customer="selectedCustomer" @add-item="addToCart" /> -->
                    <OrderHistory :customer-name="selectedCustomer.name" :customer-id="selectedCustomer.id" @add-item="addToCart" @add-remark="orderNote = $event ?? ''" />
                  </template>
                  <!-- <template #footer>
                    <div class="w-full flex justify-end">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        label="Close"
                        @click="open = false"
                      />
                    </div>
                  </template> -->

                </USlideover>

                  <!-- ปุ่มเพิ่มลูกค้าใหม่ -->
                  <UButton
                    v-if="!addingNewCustomer"
                    variant="link"
                    class="whitespace-nowrap"
                    @click="addingNewCustomer = !addingNewCustomer"
                  >
                    <template v-if="addingNewCustomer">
                      ยกเลิก
                    </template>
                    <template v-else>
                      <UIcon name="i-heroicons-plus" />เพิ่มลูกค้าใหม่
                    </template>
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
            
              <UAlert
                v-if="selectedCustomer?.description" 
                color="info"
                variant="subtle"
                :description="selectedCustomer.description"
                icon="i-lucide-info"
                class="mt-2 p-2"
              />            
              
            </div>

            <!-- รายการสินค้าในตะกร้า -->
            <div ref="cartWrapper" class="flex-1 overflow-y-auto space-y-4 min-h-0">
              <transition-group name="cart" tag="div">
                <!-- <UAlert v-if="currentOrder?.id" color="warning" icon="i-lucide-info" class="p-2 mb-2" variant="subtle" :title="`คุณกำลังแก้ไขคำสั่งซื้อ #${currentOrder.orderNumber}` " /> -->

                <div v-if="cart.length === 0" key="empty" class="text-center text-gray-500 italic mt-10">
                  ตะกร้าว่างเปล่า<br>กรุณาเลือกสินค้าเพื่อเพิ่มลงในตะกร้า
                </div>

                <div v-else>

                    <div 
                      v-for="(item, index) in cart" :key="item._uid"
                      class="border border-gray-300 dark:border-gray-700 rounded-xl p-0 sm:p-2 shadow-sm hover:shadow-md dark:hover:shadow-primary/30 transition-all bg-gray-50 dark:bg-gray-800 mb-2"
                      :class="{ 'bg-yellow-100 dark:bg-yellow-700': highlightItem === item._uid }">

                      <!-- ส่วนหัว -->
                      <div class="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                        <div class="col-span-4 font-semibold truncate text-sm sm:text-base" :title=" item.name">
                          <UBadge variant="subtle">{{ index + 1 }}</UBadge> {{ item.name }}
                        </div>

                        <!-- Input + Chip Tags -->
                        <div class="col-span-7">
                          <!-- Input -->
                          <UInput
                            v-model="item.note"
                            placeholder="เช่น 'พิเศษ ไม่เผ็ด'"
                            size="sm"
                            icon="i-lucide-message-square-text"
                            class="w-full text-sm sm:text-base flex-1"
                            :ui="{ trailing: 'pe-1' }"
                          >
                            <template v-if="item.note?.length" #trailing>
                              <UButton 
                                color="neutral"
                                variant="link"
                                size="sm"
                                icon="i-lucide-circle-x"
                                aria-label="Clear input"
                                @click="item.note = ''"
                              />
                            </template>
                          </UInput>

                          <!-- Chip / Tag Buttons -->
                          <div class="hidden sm:flex flex-wrap gap-1 mt-1">
                            <UButton
                              v-for="tag in tags"
                              :key="tag"
                              size="xs"
                              :variant="item.note?.includes(tag) ? 'solid' : 'outline'"
                              :color="item.note?.includes(tag) ? 'primary' : 'neutral'"
                              @click="toggleTag(item, tag)"
                            >
                              {{ tag }}
                            </UButton>
                          </div>
                        </div>

                        <div class="col-span-1 text-right">
                          <UButton
                            icon="i-heroicons-trash"
                            color="error"
                            variant="ghost"
                            size="sm"
                            @click="removeFromCart(index)"
                          />
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
          <div class="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 sticky bottom-0 z-10 space-y-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] bg-white dark:bg-gray-900">

            <div class="flex items-center gap-2 w-full">
              <!-- Input -->
              <UInput
                v-model="orderNote"
                size="sm"
                icon="i-lucide-scroll-text"
                placeholder="รายละเอียดเพิ่มเติมของทั้งออเดอร์ เช่น 'แยกถุง', 'ส่งก่อนเที่ยง'" 
                class="flex-1 text-sm sm:text-base min-w-0"
                :ui="{ trailing: 'pe-1' }"
              >
                <template v-if="orderNote?.length" #trailing>
                  <UButton 
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-circle-x"
                    aria-label="Clear input"
                    @click="orderNote = ''"
                  />
                </template>
              </UInput>

              <!-- Chip / Tag Buttons -->
              <div class="flex gap-1 shrink-0 overflow-x-auto">
                <UButton
                  v-for="tag in tagsNode"
                  :key="tag"
                  size="xs"
                  :variant="orderNote?.includes(tag) ? 'solid' : 'outline'"
                  :color="orderNote?.includes(tag) ? 'primary' : 'neutral'"
                  @click="toggleTagNode(tag)"
                >
                  {{ tag }}
                </UButton>
              </div>
            </div>


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
                color="primary" block @click="confirmOrder">
                <span v-if="loadingSubmit"><UIcon name="i-lucide-loader" spin /> กําลังสร้าง...</span>
                <span v-else><UIcon name="i-lucide-list-check" /> สรุปคำสั่งซื้อ</span>
              </UButton>

              <OrderReceiptModal 
                v-if="showReceipt && orderCart" 
                :model-value="showReceipt" 
                :order="orderCart"
                :loading-submit="loadingSubmit"
                @edit="showReceipt = false"
                @confirm="submitOrder"
                @close="showReceipt = false" 
                />

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
