<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

const { getProducts } = useProduct()

interface Products {
  id: string
  name: string
  price: number
  category: {
    id: string
    name: string
  }
  image?: string
}

const data = ref<Products[]>([])
const cateo = ref<SelectMenuItem[]>([])
const category = ref('all') // ค่าเริ่มต้นคือ 'all'

// ดึงข้อมูลหมวดหมู่จาก API
const { data: categoriesData } = await useFetch<{ id: string; name: string }[]>('/api/product-categories?k=')
if (categoriesData.value) {
  cateo.value = [
    { label: 'All', value: 'all' },
    ...categoriesData.value.map((cat) => ({
      label: cat.name,
      value: cat.name
    }))
  ]
}

// ดึงข้อมูลสินค้า
try {
  const products = await getProducts()
  if (Array.isArray(products)) {
    data.value = products
  } else {
    data.value = [] // fallback
  }
} catch (err) {
  console.error(err)
}

const filteredData = computed(() => {
  if (category.value === 'all') {
    return data.value
  } else {
    return data.value.filter(
      (product) => product.category.name === category.value
    )
  }
})

</script>

<template>
  <UDashboardPanel id="inbox-1" resizable>
    <div class="p-4">
      <UInput
        v-model="q"
        placeholder="Search products..."
        clearable
        class="w-full"
      />
    </div>

    <div v-if="loading" class="p-4">
      Loading products...
    </div>

    <div v-else-if="error" class="p-4 text-red-500">
      Error loading products: {{ error.message }}
    </div>

    <div v-else-if="filteredData.length === 0" class="p-4">
      No products found.
    </div>
  </UDashboardPanel>

  <UDashboardPanel id="inbox-2" resizable >
    xxxx
  </UDashboardPanel>

</template>