<script lang="ts" setup>
import { debounce } from 'lodash-es' // debounce คือ การ delays การทํางานของ function
import type { ProductCategory } from '~/types/product-category'
// const { start, finish } = useLoadingIndicator()
const toast = useToast()

const data = ref<ProductCategory[]>([])
const loading = ref(true)
const error = ref<Error | null>(null)
const loadingCreate = ref(false)

const { createProductCategory, getProductCategories } = useProductCategories()

async function onCreateProductCategory(formData: ProductCategory) {
  if (!formData.name) return

  try {
    loadingCreate.value = true
    const productCategory = await createProductCategory(formData)

    toast.add({
      title: 'Success',
      description: 'Product category ' + productCategory?.name + ' created successfully',
      color: 'success'
    })
    
    // อัพเดทข้อมูล
    data.value.push({
      name: productCategory?.name,
      id: productCategory?.id
    })

  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to create product category',
      color: 'error'
    })
  } finally {
    loadingCreate.value = false
  }

}

async function  getCategoriesList() {
  try {
    const k = q.value
    const categories = await getProductCategories(k)
    loading.value = true
    error.value = null
    // ✅ ป้องกัน null/undefined จาก response
    if (Array.isArray(categories)) {
      data.value = categories
    } else {
      data.value = [] // fallback
    }
  } catch (err) {
    console.error(err)
    error.value = err as Error
  } finally {
    loading.value = false
  }  
}

async function onUpdated(productCategory: ProductCategory) {
  const index = data.value.findIndex((item) => item.id === productCategory.id)
  data.value[index] = productCategory
}

async function onDeleted(id: string) {
  const index = data.value.findIndex((item) => item.id === id)
  data.value.splice(index, 1)
}

onMounted(() => {
  getCategoriesList()
})



const q = ref<string>()

watch(q, debounce(getCategoriesList, 500)) // ดูว่า q มีการเปลี่ยนแปลงหรือไม่ ถ้ามีการเปลี่ยนแปลงให้ใช้ debounce delay และให้เรียกใช้ fetchUser
</script>
<template>
  <div>
    <UPageCard 
    title="Product Categories" description="Manage product categories." variant="naked"
      orientation="horizontal" class="mb-4">

      <SettingsProductCategoriesModal 
      mode="add" title="Add product category" description="Add a new product category" :loading-submit="loadingCreate"
        @submit="onCreateProductCategory" />
    </UPageCard>

    <UPageCard 
    variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <UInput v-model="q" icon="i-lucide-search" placeholder="Search Product Categories" autofocus class="w-full" :ui="{ trailing: 'pe-1' }" >
            <template v-if="q?.length" #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="q = ''"
            />
          </template>
        </UInput>
      </template>
      <div v-if="error" class="p-4 text-error italic">Error: {{ error?.message }}</div>
      <SettingsProductCategoriesList 
      :product-categories="data || []" :loading-data=loading 
      @update="onUpdated($event)" 
      @delete="onDeleted($event)"/>
    </UPageCard>
  </div>
</template>