<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts"
import type { ApexOptions } from 'apexcharts'

const colorMode = useColorMode()

const props = defineProps<{
  title?: string
  seriesName?: string
  data: {
      date: string
      total: number
  }[]
}>()

const series = [
  {
    name: props.seriesName || "Total",
    data: props.data.map(d => d.total),
  },
]

const chartOptions: ApexOptions = {
  chart: {
    type: "line",
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
    zoom: {
      enabled: false,
    },
  },
  // title: {
  //   text: props.title || 'Total orders',
  //   align: 'left'
  // },
  theme: {
     mode: colorMode.value === 'dark' ? 'dark' : 'light',
  },
  grid: {
    borderColor: colorMode.value === 'dark' ? '#333' : '#e5e5e5',
  },
  // colors: [colorMode.value === 'dark' ? '#00E396' : '#008FFB'],
  // stroke: { curve: "smooth" },
  xaxis: {
    categories: props.data.map(d => d.date),
  },
  yaxis: {
    title: { text: props.seriesName || "Total" },
  },
  colors: ["#008FFB"],
  dataLabels: { enabled: true },
}
</script>

<template>
  <ClientOnly>
    <UCard>
    <template #header>
      <h2 class="text-lg font-semibold"> {{ title }} </h2>
    </template>
      <VueApexCharts
        type="line"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </UCard>
  </ClientOnly>
</template>
