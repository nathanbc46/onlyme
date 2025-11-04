<script setup lang="ts">

const { data, pending, error } = await useFetch('/api/dashboard/sales')

const stats = computed(() => {
  if (!data.value) return []

  return [
    {
      icon: 'i-lucide-trending-up',
      title: `ยอดขายวันนี้ [${formatDate(new Date(data.value.today.dateStart))}]`,
      value: data.value.today.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: data.value.today.growthPercent ?? 0
    },
    {
      icon: 'i-lucide-chart-line',
      title: `ยอดขายเดือนนี้ [${formatMonth(new Date(data.value.month.dateStart))}]`,
      value: data.value.month.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: data.value.month.growthPercent ?? 0
    },
    {
      icon: 'i-lucide-chart-scatter',
      title: 'ยอดขายเฉลี่ยต่อวันในเดือนนี้',
      value: data.value.month.averageDailySales.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 1 }),
      variation: data.value.month.growthPercent ?? 0
    },
    {
      icon: 'i-lucide-chart-no-axes-combined',
      title: `ยอดขายปีนี้ [${formatYear(new Date(data.value.year.dateStart))}]`,
      value: data.value.year.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: data.value.year.growthPercent ?? 0
    }
  ]
})


</script>
<template>
  <UDashboardPanel id="index">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Index Page">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>
      <div v-if="error" class="p-4 text-error italic">Error: {{ error?.message }}</div>
      <ClientOnly>
        <HomeStats v-if="data" :stats="stats" :pending="pending" />
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>