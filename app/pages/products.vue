<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types/product'

const toast = useToast()

const { data: products, error } = await useFetch<Product[]>(
  '/api/products?active=true',
  { method: 'GET' }
)

const groupedProducts = computed(() => {
  if (!products.value) return {}

  return products.value.reduce((acc, product) => {
    const categoryName = product.category.name

    if (!acc[categoryName]) {
      acc[categoryName] = []
    }

    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)
})

/** 🔹 ข้อความสำหรับ copy ส่งลูกค้า */
const copyText = computed(() => {
  let text = '🌶️🔥🍋‍🟩OnlyMe - เปิดร้านค่ะ มากินสุกี้​ กินยำ กินตำกันค่ะ​🌶️🔥🍋‍🟩\n🕕จันทร์ - ศุกร์ เปิด 10.00 น. - 15.00 น. , 18.00 น. - 20.00 น. \n🕖เสาร์ - อาทิตย์ เปิด 10.00 น. - 15.00 น. , 18.00 น. - 22.00 น. \n\n'

  for (const [category, items] of Object.entries(groupedProducts.value)) {
    text += `🔥${category}🌶️\n`
    items.forEach(item => {
      text += `${item.name} ${item.price} บาท\n`
    })
    text += '\n'
  }

  return text.trim()
})

/** 🔹 กดปุ่ม copy */
const copyToClipboard = async () => {
  await navigator.clipboard.writeText(copyText.value)
  toast.add({
    title: 'Success',
    description: 'Menu copied to clipboard',
    color: 'success'
  })
}
</script>

<template>
  <UDashboardPanel id="products">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Products Page">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>
      <div v-if="error" class="text-red-500">
        {{ error }}
      </div>
      

      <div v-else>
         <UButton
        icon="i-heroicons-clipboard-document"
        color="primary"
        @click="copyToClipboard"
      >
        Copy เมนู
      </UButton>
        <div
          v-for="(items, categoryName) in groupedProducts"
          :key="categoryName"
          class="mb-6 border border-gray-200 dark:border-gray-700 p-4 rounded lg:max-w-3xl"
        >
          <!-- 🔸 ชื่อหมวด -->
          <h2 class="font-bold text-lg mb-2">
            {{ categoryName }}
          </h2>

          <!-- 🔸 รายการสินค้า -->
          <ul class="pl-4 space-y-1">
            <li
              v-for="item in items"
              :key="item.id"
              class="flex justify-between"
            >
              <span>{{ item.name }}</span>
              <span>{{ item.price }} บาท</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
