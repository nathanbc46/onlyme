<script lang="ts" setup>
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row, Column } from '@tanstack/vue-table'
import { upperFirst } from 'scule'
import pica from 'pica'

const { $supabase } = useNuxtApp() 
const file = ref<File | null>(null)
const fileUrl = ref<string | null>(null)

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
// const { copy } = useClipboard()

const { deleteProduct, updateProduct } = useProduct()
const toast = useToast()
const table = useTemplateRef('table')

const columnVisibility = ref({
  id: false // ซ่อนคอลัมน์ id
})


interface Products {
  id: string
  name: string
  price: number
  cost: number
  category: {
    id: string
    name: string
  }
  image?: string
}

interface ProductForm {
  name: string
  price: number
  cost: number
  categoryId: string
  image?: string
}

const props = withDefaults(defineProps<{
  products?: Products[]
  loadingData?: boolean,
  categories?: { id: string; name: string }[]
}>(), {
  products: () => [],
  loadingData: true,
  categories: () => []
})

const emit = defineEmits(['update', 'delete'])

const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedProduct = ref<Products | null>(null)
const loadingUpdate = ref(false)
const loadingDelete = ref(false)

const openEditModal = (product: Products) => {
  selectedProduct.value = product
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedProduct.value = null
}

const openDeleteModal = (product: Products) => {
  selectedProduct.value = product
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedProduct.value = null
}

async function onDeleteProduct(id: string) {
  if (!id) return
  try {
    loadingDelete.value = true
    const data = await deleteProduct(id)
    toast.add({
      title: 'Success',
      description: 'Product ' + data?.name + ' deleted successfully',
      color: 'success'
    })
    emit('delete', id)
    closeDeleteModal()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to delete product',
      color: 'error'
    })
  } finally {
    loadingDelete.value = false
  }
}

function extractPathFromUrl(url: string) {
  const parts = url.split('/onlyme-uploads/')[1]
  return parts // เช่น "public/myphoto.png"
}

async function resizeImage(imageFile: File) {
  const img = new Image()
  img.src = URL.createObjectURL(imageFile)
  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 300

  const picaInstance = pica()

  await picaInstance.resize(img, canvas, {
    // unsharpAmount: 80,
    // unsharpRadius: 0.6,
    // unsharpThreshold: 2
  })

  const blob = await picaInstance.toBlob(canvas, imageFile.type, 0.9)

  return new File([blob], imageFile.name, { type: imageFile.type })
}

const uploadFile = async () => {
  if (!file.value) return alert('กรุณาเลือกไฟล์')

  try {
      const { data, error } = await $supabase.storage
        .from('onlyme-uploads') // ชื่อ bucket
        .upload(`public/${file.value.name}`, file.value)

      console.log(data, error)

      if (error){
        console.error(error)
        throw new Error(error.message)
      } 

      const { data: publicUrl } = $supabase.storage.from('onlyme-uploads').getPublicUrl(`public/${file.value.name}`)
      fileUrl.value = publicUrl.publicUrl
    }  catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to upload image',
      color: 'error'
    })
  }
}


const deleteImage = async (path: string) => {
  try {
  const { data, error } = await $supabase.storage
    .from('onlyme-uploads') // ชื่อ bucket
    .remove([path])  // ต้องเป็น array

  if (error) {
    console.error(error)
    throw new Error(`Cannot delete image at path '${path}'. Error: ${error?.message || 'Unknown error'}`)
  }
  console.log('ลบสำเร็จ', data)    
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to delete image',
      color: 'error'
    })
  }

}

const updatedRowId = ref<string | null>(null)
async function onUpdateProduct(oldImage: string | null | undefined, id: string | undefined, formData: ProductForm, imageFile?: File) {
  //console.log('onUpdateProduct', id, formData, imageFile, oldImage) 

  if (!id) return

  let imageUrl: string | null = ''

  if (imageFile) {
    try {
      loadingUpdate.value = true
      if (!imageFile.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file(jpg, jpeg, png)")
      }

      // file.value = imageFile
      const newFile = await resizeImage(imageFile)
      file.value = newFile
      // const buffer = await sharp(imageFile).resize({ width: 200, height: 200, fit: sharp.fit.cover }).png().toBuffer()
      // const newFile = new File([buffer], imageFile.name, { type: imageFile.type })
      // file.value = newFile
      await uploadFile()

      imageUrl = fileUrl.value

      //ลบไฟล์เก่า
      console.log('oldImage',oldImage)
      if(oldImage){
        const path = extractPathFromUrl(oldImage)
        console.log('path',path)
        if (path) {
          await deleteImage(path)
        }

      }
      // 👉 อัพโหลดไฟล์ไปที่ API
      /* const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("oldImage", oldImage || '' )

      const uploadRes = await $fetch<{ url: string }>("/api/products/upload-image", {
        method: "POST",
        body: formData,
      }) */

      //console.log(uploadRes)

      //imageUrl = uploadRes.url // ได้ path เช่น /uploads/xxxx.png
      //console.log(imageUrl)
    } catch (error) {
      console.error(error)
    }
  }

  try {
    loadingUpdate.value = true
    const res = await updateProduct(id, { ...formData, image: imageUrl })
    toast.add({
      title: 'Success',
      description: 'Product ' + res?.name + ' updated successfully',
      color: 'success'
    })
    emit('update', res)

    // ไฮไลต์แถว
    updatedRowId.value = id
    setTimeout(() => {
      updatedRowId.value = null // ยกเลิก highlight หลัง 2 วินาที
    }, 2000)

    closeEditModal()
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to update product',
      color: 'error'
    })
  } finally {
    loadingUpdate.value = false
  }
}

//const categories  = await $fetch<{ id: string; name: string }[]>('/api/product-categories?k=')

//table data
type ProductsTable = {
  id: string
  name: string
  price: number
  cost: number
  category: string
  image?: string
}

// console.log('products', props.products)
// ✅ ใช้ toRef เพื่อให้ reactive กับ props.products
const productsRef = toRef(props, 'products') 

const productsTable = computed<ProductsTable[]>(() => {
  return productsRef.value.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    cost: product.cost,
    category: product.category.name,
    image: product?.image
  }))
})

function getCellClass(row: Row<ProductsTable>) {
  return row.getValue('id') === updatedRowId.value
    ? 'bg-yellow-100 dark:bg-yellow-600 transition-colors'
    : ''
}

const columns: TableColumn<ProductsTable>[] = [
  {
    accessorKey: 'id',
    header: '#',
    meta: {
      class: {
        th: 'text-center font-semibold',
        td: 'text-center font-mono'
      }
    },
   cell: ({ row }) => h('div', { class: ['text-center', getCellClass(row)] }, `#${row.getValue('id')}`)
  },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => h('div', { class: [getCellClass(row)] }, row.getValue('image') ? h('img', { src: row.getValue('image'), alt: 'Product Image', class: 'w-10 h-10 object-cover rounded' }) : 'No Image'),
    meta: {
      class: { td: 'text-center' }
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Product Name'),
     cell: ({ row }) => h('div', { class: ['font-medium text-highlighted', getCellClass(row)] }, row.getValue('name')),
  },
  {
    accessorKey: 'category',
    header: ({ column }) => getHeader(column, 'Category'),
     cell: ({ row }) => h('div', { class: ['font-medium', getCellClass(row)] }, row.getValue('category')),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => getHeader(column, 'Price'),
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const price = Number.parseFloat(row.getValue('price'))
      const formatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(price)
      return h('div', { class: 'text-right w-full' },
            h(UBadge, { class: ['text-base',getCellClass(row)], variant: 'subtle', color: 'success' },  () => formatted)
          )
    }
  },
  {
    accessorKey: 'cost',
    header: ({ column }) => getHeader(column, 'Cost'),
    meta: {
      class: {
        th: 'text-right font-semibold',
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const cost = Number.parseFloat(row.getValue('cost'))
      const formatted = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(cost)
        return h('div', { class: 'text-right w-full' },
        h(UBadge, { class: ['text-base',getCellClass(row)], variant: 'subtle', color: 'warning' },  () => formatted)
      )
    }
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      return h('div', { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown'
            })
        ),
      )
    }
  }
]

function getRowItems(row: Row<ProductsTable>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      type: 'separator'
    },
    {
      label: 'Edit product',
      icon: 'i-lucide-edit-2',
      onSelect() {
        openEditModal(props.products.find(p => p.id === row.getValue('id'))!)
      }
    },
    {
      label: 'Delete product',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        openDeleteModal(props.products.find(p => p.id === row.getValue('id'))!)
      }
    }
  ]
}

function getHeader(column: Column<ProductsTable>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start'
      },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          }
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          }
        }
      ]
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`
      })
  )
}

const categoryFilter = ref('all')

// watch(() => categoryFilter.value, (newVal) => {
//   if (!table?.value?.tableApi) return

//   const statusColumn = table.value.tableApi.getColumn('category')
//   if (!statusColumn) return

//   if (newVal === 'all') {
//     statusColumn.setFilterValue(undefined)
//   } else {
//     statusColumn.setFilterValue(newVal)
//   }
// })

// ✅ filter data ตาม category (แยกจาก UTable)
const filteredProducts = computed(() => {
  if (categoryFilter.value === 'all') return productsTable.value
  return productsTable.value.filter(p => p.category === categoryFilter.value)
})

const formattedCategories = computed(() =>
  (props.categories || []).map(c => ({
    label: c.name,
    value: c.name
  }))
)

// เพื่อรีเฟรชตารางเมื่อ data เปลี่ยนแปลง
// const tableKey = ref(0)
// watch(() => props.products, () => {
//   tableKey.value++
// }, { deep: true })
const globalFilter = ref('')
</script>

<template>
  <div>
    <div class="flex flex-col flex-1 w-full">
      <div class="flex px-4 py-3.5 border-b border-accented gap-3 items-center">
        <!-- <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." /> -->
         <UInput v-model="globalFilter" icon="i-lucide-search" placeholder="Search Products / Categories" autofocus class="w-full"  :ui="{ trailing: 'pe-1' }" >
            <template v-if="globalFilter?.length" #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="globalFilter = ''"
            />
          </template>
        </UInput>

        <USelect
            v-model="categoryFilter"
            :items="[
                  { label: 'All', value: 'all' },
                  ...formattedCategories
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status"
            class="min-w-28"
          />

            <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
      </div>

      <!-- <ul>
        <li v-for="product in productsTable" :key="product.id" class="p-4 border-b border-accented flex items-center justify-between"> {{ product.name }} - {{ product.category }} - {{ product.price }}
          </li>
      </ul> -->

      <UTable 
      ref="table"
      v-model:column-visibility="columnVisibility"
      sticky 
      :columns="columns" 
      :global-filter="globalFilter" 
      :loading="loadingData" loading-color="primary"
       loading-animation="carousel" 
      :data="filteredProducts" 
      :rows = filteredProducts
      class="flex-1" >
      <template #loading>
        <UIcon name="i-lucide-loader" spin /> Loading products...
      </template>
    </UTable>
      <div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
       {{ filteredProducts.length }} row(s)
    </div>
    </div>


    <!-- 🧩 ใช้ modal เดียว -->
    <SettingsProductModal 
    v-model:open="isEditModalOpen" mode="edit" title="Edit product"
      :description="'Edit product details'+ (selectedProduct?.name ? ': ' + selectedProduct?.name : '')" :product="selectedProduct" :categories="categories" :loading="loadingUpdate"
      @submit="(data, imageFile) => onUpdateProduct(selectedProduct?.image, selectedProduct?.id, data, imageFile)" 
      />
    <!-- @submit="selectedProduct && onUpdateProduct(selectedProduct.id, $event)"  -->
    <SettingsConfirmModal 
    v-model:open="isDeleteModalOpen" mode="delete" title="Delete product"
      :description="'Are you sure you want to delete this product \'' + selectedProduct?.name + '\' ?'"
      :loading="loadingDelete"
      @confirm="selectedProduct && onDeleteProduct(selectedProduct.id)" />
  </div>
</template>
