<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface Members {
  id: string
  name: string
  email: string
  description: string
  createdAt: string
  orderCount: number
  totalSales: number
}
const members = ref<Members[]>([])
const error = ref<Error | null>(null)
const status = ref<'pending' | 'success' | 'error'>('pending')

const loadData = async () => {

  try {
    status.value = 'pending'
    error.value = null
    const data = await $fetch('/api/customers/list')
    members.value = data.data || []

    console.log('members', members.value)

    //console.log('meta',meta.value)
    // console.log('Orders',orders.value)
  } catch (err) {
    console.error(err)
    error.value = err as Error
  } finally {
    status.value = 'success'
  }
}

onMounted(() => {
  loadData()
})

const columnVisibility = ref({
  id: false, // ซ่อนคอลัมน์ id
  email: false,
})

const column = ref<TableColumn<Members>[]>([
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'description', header: 'Description' },

  { accessorKey: 'orderCount', header: 'Order Count',
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right font-mono'
      }
    },
    cell: ({ row }) => {
      const orderCount = Number.parseFloat(row.getValue('orderCount'))
      const formatted = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0 }).format(orderCount)
      return h(UBadge, { class: 'text-sm',color: 'neutral', variant: 'subtle' }, () => formatted)
    }
  },
  { accessorKey: 'totalSales', header: 'Total Sales',
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right font-mono'
      }
    },
    cell: ({ row }) => {
      const totalAmount = Number.parseFloat(row.getValue('totalSales'))
      const formatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(totalAmount)
      return h(UBadge, { class: 'text-sm',color: 'info', variant: 'subtle' }, () => formatted)
    }
  },
  {
    accessorKey: 'createdAt', header: 'Created At',
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue('createdAt'))
      const formatted = formatDateTime(createdAt)
      return h('div', { class: 'text-center' }, formatted)
    }
  },
])

</script>
<template>
  <UDashboardPanel id="customers">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Customers Page">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>
      <!-- Content for Page goes here -->
      <div v-if="error" class="p-4 text-error italic">Error: {{ error?.message }}</div>
      <UTable v-else v-model:column-visibility="columnVisibility" :columns="column" :data="members" :loading="status === 'pending'"  class="flex-1">
        <template #loading>
          <UIcon name="i-lucide-loader" spin /> Loading ...
        </template>
      </UTable>

    </template>
  </UDashboardPanel>
</template>