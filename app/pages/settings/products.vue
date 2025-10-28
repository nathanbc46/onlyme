<script lang="ts" setup>
import { debounce } from 'lodash-es'
const { createProduct, getProducts } = useProduct()
const toast = useToast()
const q = ref<string>('')

interface Product {
  id?: string
  name: string
  price: number
  categoryId: string
  image?: string
}

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


const data = ref<Products[]>([]) // ✅ เริ่มต้นเป็น array เปล่า
const loading = ref(true)
const error = ref<Error | null>(null)

//const { data: categories } = await useFetch<{ id: string; name: string }[]>('/api/product-categories?k=')
async function getProductList() {
  try {
    const k = q.value
    const products = await getProducts(k)
    error.value = null
    // ✅ ป้องกัน null/undefined จาก response
    if (Array.isArray(products)) {
      data.value = products
    } else {
      data.value = [] // fallback
    }
    //console.log('Fetched products:', data.value)
  } catch (err) {
    console.error(err)
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getProductList()
})

watch(q, debounce(getProductList, 300))

async function onCreateProduct(formData: Product, imageFile?: File) {
  if (!formData) return

  console.log('onCreateProduct', formData, imageFile)
  let imageUrl: string | undefined

  if (imageFile) {
    try {
      if (!imageFile.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file(jpg, jpeg, png)")
      }
      // 👉 อัพโหลดไฟล์ไปที่ API
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("oldImage", '')

      const uploadRes = await $fetch<{ url: string }>("/api/products/upload-image", {
        method: "POST",
        body: formData,
      })

      console.log('uploadurl', uploadRes)

      imageUrl = uploadRes.url // ได้ path เช่น /uploads/xxxx.png
      //console.log(imageUrl)
    } catch (error) {
      console.error(error)
    }
  }

  try {
    const product = await createProduct({ ...formData, image: imageUrl })
    //getProductList()

    data.value = [
      ...data.value,
      {
        id: product?.id,
        name: product?.name,
        price: product?.price,
        category: {
          id: product?.category?.id,
          name: product?.category?.name
        },
        image: product?.image
      }
    ]

    toast.add({
      title: 'Success',
      description: 'Product ' + product?.name + ' created successfully',
      color: 'success'
    })
    closeEditModal()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to create product',
      color: 'error'
    })
  }
}

async function onDeleted(id: string) {
  const index = data.value.findIndex((item) => item.id === id)
  data.value.splice(index, 1)
}

async function onUpdated(product: Products) {
  //const index = data.value.findIndex((item) => item.id === product.id)
  data.value = data.value.map(p =>
    p.id === product.id ? product : p
  )

  //console.log('Updated product in list', data.value)
}

const isEditModalOpen = ref(false)
const selectedProduct = ref<Products | null>(null)

const openEditModal = () => {
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedProduct.value = null
}

const categories = await $fetch<{ id: string; name: string }[]>('/api/product-categories?k=')

//console.log('categories', categories)
</script>
<template>
  <div>
    <UPageCard title="Products" description="Manage products." variant="naked" orientation="horizontal" class="mb-4">

      <UButton 
      icon="i-lucide-plus" label="Add Product" color="neutral" class="w-fit lg:ms-auto"
        @click="openEditModal()" />
    </UPageCard>
    <SettingsProductsList 
    :products="data || []" :loading-data="loading" :categories="categories"
      @delete="onDeleted($event)" @update="onUpdated($event)" />

    <!-- 🧩 ใช้ modal เดียว -->
    <SettingsProductModal 
    v-model:open="isEditModalOpen" mode="add" title="Add product" description="Add a new product"
      :product="selectedProduct" :categories="categories"
      @submit="(formData, imageFile) => onCreateProduct(formData, imageFile)" />
  </div>
</template>