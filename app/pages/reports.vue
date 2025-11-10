<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
// const { getOrders } = useOrder()
// const { start, finish } = useLoadingIndicator()
// import { useDebounceFn } from '@vueuse/core'
import { debounce } from 'lodash-es'
//const table = useTemplateRef('table')
const UBadge = resolveComponent('UBadge')

interface Order {
  id: string
  orderNumber: string
  totalAmount: number | string
  totalCost: number | string | null
  status: string
  createdAt: string
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
const meta = ref<{ total: number , page: number , pageSize: number , totalPages: number}>()
const error = ref<Error | null>(null)
const status = ref<'pending' | 'success' | 'error'>('pending')

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})

// Search input
const searchTerm = ref('')

const loadData = async () => {

  try {
    status.value = 'pending'
    error.value = null
    const data = await $fetch('/api/orders', {
      query: {
        page: pagination.value.pageIndex,
        pageSize: pagination.value.pageSize,
        search: searchTerm.value
      },
    })

    orders.value = data.data || []
    meta.value = data.meta || { total: 0 }

    //console.log('meta',meta.value)
    // console.log('Orders',orders.value)
  } catch (err) {
    console.error(err)
    error.value = err as Error
  } finally {
    status.value = 'success'
  }
}


watch(searchTerm, debounce(loadData, 500))
watch([() => pagination.value.pageIndex, () => pagination.value.pageSize], loadData, { immediate: true })

const columnVisibility = ref({
  id: false // ซ่อนคอลัมน์ id
})

const isPrintModalOpen = ref(false)
const selectedOrder = ref<Order | null>(null)

const openPrintModal = (order: Order) => {
  selectedOrder.value = order
  //console.log('selectedOrder',selectedOrder.value)
  isPrintModalOpen.value = true
}

interface OrderTable {
  id: string
  orderNumber: string
  totalAmount: number | string
  totalCost: number | string | null
  profit: number
  createdAt: string
  customer: string
  orderItems: string
}

const dataTable = computed<OrderTable[]>(() => {
  return orders.value?.map((order: Order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    totalCost: order.totalCost,
    profit: Number(order.totalAmount) - Number(order.totalCost),
    createdAt: order.createdAt,
    customer: order.customer.name,
    orderItems: order.orderItems
      .map((item: { quantity: number | string; product: { name: string } }) => `${item.product.name} (${item.quantity})`)
      .join(', '),
  })) ?? []
})


const columns: TableColumn<OrderTable>[] = [
  {
    accessorKey: 'id',
    header: '#',
    meta: {
      class: {
        th: 'text-center font-semibold',
        td: 'text-center'
      }
    },
  },
  { accessorKey: 'orderNumber', header: 'Order Number',
    cell: ({ row }) => {
      return h(
        'span',
        { 
          class: 'font-mono cursor-pointer hover:underline',
          onClick: () => openPrintModal(orders.value.find(o => o.id === row.getValue('id'))!)
        },
        row.getValue('orderNumber')
      )
    }
   },


  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'totalAmount', header: 'Total Amount',
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const totalAmount = Number.parseFloat(row.getValue('totalAmount'))
      const formatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(totalAmount)
      return h(UBadge, { class: 'text-base',color: 'info', variant: 'subtle' }, () => formatted)
    }
   }, 
{ accessorKey: 'totalCost', header: 'Total Cost',
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const totalCost = Number.parseFloat(row.getValue('totalCost'))
      const formatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(totalCost)
      return h(UBadge, { class: 'text-base',color: 'warning', variant: 'subtle' }, () => formatted)
    }
   },   
   { accessorKey: 'profit', header: 'Profit',
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const profit = Number.parseFloat(row.getValue('profit'))
      const formatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(profit)
      return h(UBadge, { class: 'text-base', color: 'success', variant: 'subtle' }, () => formatted)
    }
   },
   { accessorKey: 'orderItems', header: 'Order Items' },
  { accessorKey: 'createdAt', header: 'Created At',
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue('createdAt'))
      const formatted = formatDateTime(createdAt)
      return h('div', { class: 'text-center' }, formatted)
    }
   },
  ]
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
      <!-- <h1 class="text-2xl font-semibold">Comming Soon</h1> -->
      <!-- Content for Page goes here -->
            <!-- Search input -->
      <div class="p-2">
        <UInput
          v-model="searchTerm"
          placeholder="Search orders..."
          class="input input-bordered w-full"
          :ui="{ trailing: 'pe-1' }" >
            <template v-if="searchTerm?.length" #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="searchTerm = ''"
            />
          </template>
        </UInput>
      </div>

      <div v-if="error" class="p-4 text-error italic">Error: {{ error?.message }}</div>


      <UTable 
      v-else 
      ref="table"
      v-model:column-visibility="columnVisibility" 
      sticky="header"
      :data="dataTable" 
      :columns="columns"
      :loading="status === 'pending'" 
      class="flex-1" >
      <template #loading>
        <UIcon name="i-lucide-loader" spin /> Loading ...
      </template>
    </UTable>

      <div class="flex items-center justify-center gap-6  text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-700">Total:</span>
          <span>{{ meta?.total || 0 }}</span>
          <span class="text-gray-400">•</span>
          <span>Page</span>
          <span class="font-semibold text-gray-700">{{ pagination.pageIndex }}</span>
          <span>of</span>
          <span class="font-semibold text-gray-700">{{ Math.ceil((meta?.total || 0) / pagination.pageSize) }}</span>
        </div>

        <UPagination
          v-model:page="pagination.pageIndex"
          :items-per-page="pagination.pageSize"
          :total="meta?.total || 0"
          class="text-sm!"
        />
    </div>

      <OrderReceiptModal 
      v-if="isPrintModalOpen && selectedOrder" 
      :model-value="isPrintModalOpen" 
      :order="selectedOrder"
      @edit="isPrintModalOpen = false; navigateTo(`/orders-food?id=${selectedOrder.id}`)"
      @close="isPrintModalOpen = false"/>

    </template>
  </UDashboardPanel>



</template>