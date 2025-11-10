<script setup lang="ts">
import VueApexCharts from "vue3-apexcharts"
import type { ApexOptions } from 'apexcharts'

const colorMode = useColorMode()

// ✅ สร้าง type ปลอดภัย
type ChartData = {
  date: string
  [key: string]: string | number
}

const props = defineProps<{
  title?: string
  data: ChartData[]
}>()

// ✅ ดึง key ทั้งหมด ยกเว้น "date"
const keys = Object.keys(props.data[0] || {}).filter(k => k !== "date")

// ✅ สร้าง series อัตโนมัติ
const series = keys.map(key => ({
  name: key, // หรือจะ map เป็นชื่อไทยภายหลังก็ได้
  data: props.data.map(d => d[key]),
}))

// ✅ ตั้งค่า chart
const chartOptions: ApexOptions = {
  chart: {
    type: "line",
    toolbar: { show: false },
    background: 'transparent',
    zoom: { enabled: false },
  },
  theme: {
    mode: colorMode.value === 'dark' ? 'dark' : 'light',
  },
  grid: {
    borderColor: colorMode.value === 'dark' ? '#333' : '#e5e5e5',
  },
  // stroke: { curve: "smooth" },
  xaxis: {
    categories: props.data.map(d => formatDate(new Date(d.date))),
  },
  yaxis: {
    title: { text: "ค่าต่างๆ" },
  },
  dataLabels: { enabled: true },
  colors: colorMode.value === 'dark'
    ? ["#008FFB", "#00E68A", "#FEB019", "#FF4560", "#775DD0"] // 🌙 dark
    : ["#008FFB", "#00B36A", "#FEB019", "#FF4560", "#775DD0"], // ☀️ light
  legend: {
    position: 'top',
    horizontalAlign: 'center',
  },
}
</script>

<template>
  <ClientOnly>
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ title }}</h2>
      </template>

      <VueApexCharts
        type="line"
        height="350"
        :options="chartOptions"
        :series="series"
      />
    </UCard>
  </ClientOnly>
</template>
