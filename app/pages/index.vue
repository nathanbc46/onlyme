<script setup lang="ts">

const { data, pending, error } = await useFetch('/api/dashboard/sales')

const stats = ref([
  {
    icon: 'i-lucide-trending-up',
    title: 'ยอดขายวันนี้ ['+ (data.value?.today ? 
                          formatDate(new Date(data.value.today.dateStart))
                          : '') +']',
    value: data.value?.today.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }) ?? 0,
    variation: data.value?.today.growthPercent ?? 0
  },
  {
    icon: 'i-lucide-chart-line',
    title: 'ยอดขายเดือนนี้ ['+ (data.value?.month ? 
                          formatMonth(new Date(data.value.month.dateStart))
                          : '') +']',
    value: data.value?.month.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }) ?? 0,
    variation: data.value?.month.growthPercent ?? 0
  },
  {
    icon: 'i-lucide-chart-scatter',
    title: 'ยอดขายเฉลี่ยต่อวันในเดือนนี้',
    value: data.value?.month.averageDailySales.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 1 }) ?? 0,
    variation: data.value?.month.growthPercent ?? 0
  },
  {
    icon: 'i-lucide-chart-no-axes-combined',
    title: 'ยอดขายปีนี้ ['+ (data.value?.year ? 
                          formatYear(new Date(data.value.year.dateStart))
                          : '') +']',
    value: data.value?.year.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }) ?? 0,
    variation: data.value?.year.growthPercent ?? 0
  },
])


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
        <HomeStats v-else-if="!pending && data" :stats="stats" />
        <div v-else class="p-4">Loading...</div>
    </template>
  </UDashboardPanel>
</template>