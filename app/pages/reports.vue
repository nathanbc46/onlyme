<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { debounce } from 'lodash-es'
const { deleteOrder, updateOrderStatus } = useOrder()
// const { start, finish } = useLoadingIndicator()
// import { useDebounceFn } from '@vueuse/core'

//const table = useTemplateRef('table')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()

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
const loadingDelete = ref(false)
const isDeleteModalOpen = ref(false)
const isCancelModalOpen = ref(false)
const newOrderStatus = ref('')

const openPrintModal = (order: Order) => {
  selectedOrder.value = order
  //console.log('selectedOrder',selectedOrder.value)
  isPrintModalOpen.value = true
}

const openDeleteModal = (order: Order) => {
  selectedOrder.value = order
  isDeleteModalOpen.value = true
}

const openCancelModal = (order: Order, status: string) => {
  newOrderStatus.value = status
  selectedOrder.value = order
  isCancelModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedOrder.value = null
}

const closeCancelModal = () => {
  isCancelModalOpen.value = false
  selectedOrder.value = null
}

async function onStatusChange(id: string, status: string) {
  if (!id) return
  try {
    loadingDelete.value = true
    const data = await updateOrderStatus(id, status)
    toast.add({
      title: 'Success',
      description: 'Order ' + data?.orderNumber + ' ' + status + ' successfully',
      color: 'success'
    })
    loadData()
    closeCancelModal()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to ' + status + ' order',
      color: 'error'
    })
  } finally {
    loadingDelete.value = false
  }
}

async function onDeleteOrder(id: string) {
  if (!id) return
  try {
    loadingDelete.value = true
    const data = await deleteOrder(id)
    toast.add({
      title: 'Success',
      description: 'Order ' + data?.orderNumber + ' deleted successfully',
      color: 'success'
    })
    loadData()
    closeDeleteModal()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to delete order',
      color: 'error'
    })
  } finally {
    loadingDelete.value = false
  }
}

interface OrderTable {
  id: string
  orderNumber: string
  totalAmount: number | string
  totalCost: number | string | null
  status: string
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
    status: order.status,
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
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      class: {
        th: 'text-center font-semibold',
        td: 'text-center'
      }
    },
    cell: ({ row }) => {
      const status = row.original.status
      const isCancelled = status === 'CANCELLED'

      return h(
        'span',
        { class: isCancelled ? 'text-error font-semibold' : '' },
        status
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
  {
    id: 'actions',
    cell: ({ row }) => {
      return h('div', { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown'
            })
        ),
      )
    }
  }
  ]

function getRowItems(row: Row<OrderTable>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      type: 'separator'
    },
    ...(row.getValue('status') !== 'CANCELLED'
      ? [
    {
      label: 'CANCELLED Order',
      icon: 'i-lucide-circle-x',
      color: 'warning',
      onSelect() {
        openCancelModal(
          orders.value.find(p => p.id === row.getValue('id'))!,
          'CANCELLED'
        )
      }
    }
    ]
    : []),

    // ⬇⬇⬇ เงื่อนไขไม่ใช่ CLOSED ค่อยแสดงเมนู
    ...(row.getValue('status') !== 'CLOSED'
      ? [
          {
            label: 'CLOSED Order',
            icon: 'i-lucide-circle-check',
            color: 'success',
            onSelect() {
              openCancelModal(
                orders.value.find(p => p.id === row.getValue('id'))!,
                'CLOSED'
              )
            }
          }
        ]
      : []),

    {
      label: 'Delete Order',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        openDeleteModal(
          orders.value.find(p => p.id === row.getValue('id'))!
        )
      }
    }
  ]
}

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

    <SettingsConfirmModal 
    v-model:open="isDeleteModalOpen" mode="delete" title="Delete order"
      :description="'Are you sure you want to delete this order \'' + selectedOrder?.orderNumber + ' - (' + selectedOrder?.customer.name + ')\' ?'"
      :loading="loadingDelete"
      @confirm="selectedOrder && onDeleteOrder(selectedOrder.id)" />

    <SettingsConfirmModal 
    v-model:open="isCancelModalOpen" mode="delete" :title="`Change order status to ${newOrderStatus}` "
      :description="'Are you sure you want to ' + newOrderStatus + ' this order \'' + selectedOrder?.orderNumber + ' - (' + selectedOrder?.customer.name + ')\' ?'"
      :loading="loadingDelete"
      :btn-color="newOrderStatus === 'CLOSED' ? 'success' : 'warning'"
      :btn-text="`Chang to ${newOrderStatus}` "
      @confirm="selectedOrder && onStatusChange(selectedOrder.id,newOrderStatus)" />

    </template>
  </UDashboardPanel>



</template>