<script setup lang="ts">
const { data, pending, error } = useFetch('/api/dashboard/sales')

console.log('data', data.value)
const stats = computed(() => {

  if (!data.value) return []

  const todayProfit = Number(data.value.today.total) - Number(data.value.today.todayCost)
  const monthProfit = Number(data.value.month.total) - Number(data.value.month.monthCost)
  const yearProfit = Number(data.value.year.total) - Number(data.value.year.yearCost)
  //console.log('data', data.value)
  return [
    {
      icon: 'i-lucide-trending-up',
      title: `ยอดขายวันนี้ [${formatDate(new Date(data.value.today.dateStart))}]`,
      value: data.value.today.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: data.value.today.growthPercent ?? 0,
      bg: 'info'
    },
    {
      icon: 'i-lucide-chart-line',
      title: `ยอดขายเดือนนี้ [${formatMonth(new Date(data.value.month.dateStart))}]`,
      value: data.value.month.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: data.value.month.growthPercent ?? 0,
      bg: 'info'
    },
    {
      icon: 'i-lucide-chart-scatter',
      title: 'ยอดขายเฉลี่ยต่อวันในเดือนนี้',
      value: data.value.month.averageDailySales.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 1 }),
      variation: data.value.month.growthPercent ?? 0,
      bg: 'info'
    },
    {
      icon: 'i-lucide-chart-no-axes-combined',
      title: `ยอดขายปีนี้ [${formatYear(new Date(data.value.year.dateStart))}]`,
      value: data.value.year.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: data.value.year.growthPercent ?? 0,
      bg: 'info'
    },
    {
      icon: 'i-lucide-trending-up',
      title: `กำไรวันนี้ [${formatDate(new Date(data.value.today.dateStart))}]`,
      value: todayProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: 0,
      bg: 'success'
    },
    {
      icon: 'i-lucide-chart-line',
      title: `กำไรเดือนนี้ [${formatMonth(new Date(data.value.today.dateStart))}]`,
      value: monthProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: 0,
      bg: 'success'
    },
    {
      icon: 'i-lucide-chart-scatter',
      title: `กำไรเฉลี่ยต่อวันในเดือนนี้`,
      value: data.value.month.averageDailyProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: 0,
      bg: 'success'
    },
    {
      icon: 'i-lucide-chart-no-axes-combined',
      title: `กำไรปีนี้ [${formatYear(new Date(data.value.year.dateStart))}]`,
      value: yearProfit.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }),
      variation: 0,
      bg: 'success'
    },
  ]
})

const columnVisibility = ref({
  id: false // ซ่อนคอลัมน์ id
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
     
      <ClientOnly v-if="!pending && data">
        <HomeStats :stats="stats" :pending="pending" />
        <UPageGrid class="lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-6">
          <LineChart :data="data.chart.last7Days" title="ยอดขาย 7 วันล่าสุด" series-name="ยอดขาย" />
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Top 5 สินค่าขายดี</h3>
            </template>
            <template #default>
              <UTable v-model:column-visibility="columnVisibility" :data="data.topProducts" />
            </template>
          </UCard>
        </UPageGrid>
      </ClientOnly>
      
      <div v-else>
        <UIcon name="i-lucide-loader" spin /> Loading ...
      </div>
    </template>
  </UDashboardPanel>
</template>