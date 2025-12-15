<script lang="ts" setup>
import type { ProductCategory } from '~/types/product-category'

withDefaults(defineProps<{
    productCategories: ProductCategory[]
    loadingData?: boolean
}>()
    , {
        loadingData: true
})

const emit = defineEmits(['update', 'delete'])

const isDeleteModalOpen = ref(false)
const selectedProduct = ref<ProductCategory | null>(null)
const loadingUpdate = ref(false)
const loadingDelete = ref(false)

const openDeleteModal = (product: ProductCategory) => {
  selectedProduct.value = product
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedProduct.value = null
}


const { updateProductCategory, deleteProductCategory } = useProductCategories()
const toast = useToast()

async function onUpdateProductCategory(id: string, formData: ProductCategory) {
    if (!formData.name) return

    try {
        loadingUpdate.value = true
        const data = await updateProductCategory(id, formData)

        toast.add({
        title: 'Success',
        description: 'Product category ' + data?.name + ' updated successfully',
        color: 'success'
        })

        emit('update', data)

    } catch (error) {
        console.error(error)
        toast.add({
        title: 'Error',
        description: (error as Error).message || 'Failed to create product category',
        color: 'error'
        })
    } finally {
        loadingUpdate.value = false
    }
   
}

async function onDeleteProductCategory(id: string) {
    try {
        loadingDelete.value = true
        const data = await deleteProductCategory(id)
        toast.add({
        title: 'Success',
        description: 'Product category ' + data?.name + ' deleted successfully',
        color: 'success'
        })

        emit('delete', id)
        closeDeleteModal()
    } catch (error) {
        console.error(error)
        toast.add({
        title: 'Error',
        description: (error as Error).message || 'Failed to delete product category',
        color: 'error'
        })
    } finally {
        loadingDelete.value = false
    }
}

</script>
<template>
    <ClientOnly>
        <div v-if="loadingData" class="p-4 text-muted italic">
            <UIcon name="i-lucide-loader" class="animate-spin" /> Loading...
        </div>
        <ul v-else-if="productCategories.length" class="divide-y divide-default">
            <li
                v-for="productCategory in productCategories"
                :key="productCategory.id"
                class="
                grid grid-cols-12 gap-3
                items-center
                py-2 px-4 sm:px-6
                "
            >
                <!-- ชื่อหมวด -->
                <div class="col-span-12 sm:col-span-6 truncate">
                {{ productCategory.name }}
                </div>

                <!-- สถานะ -->
                <div class="col-span-6 sm:col-span-3 text-sm">
                <span
                    :class="productCategory.active ? 'text-green-600' : 'text-gray-400'"
                >
                    {{ productCategory.active ? 'Active' : 'Inactive' }}
                </span>
                </div>

                <!-- Actions -->
                <div class="col-span-6 sm:col-span-3 flex justify-end gap-2">
                <UButton
                    color="error"
                    variant="subtle"
                    size="xs"
                    icon="i-lucide-trash"
                    @click="openDeleteModal(productCategory)"
                />

                <SettingsProductCategoriesModal
                    mode="edit"
                    title="Edit product category"
                    :name="productCategory.name"
                    description="Edit a new product category"
                    :loading-submit="loadingUpdate"
                    @submit="onUpdateProductCategory(productCategory.id!, $event)"
                />
                </div>
            </li>
            </ul>

        <div v-else class="p-4 text-muted italic">
            No product categories
        </div>

    <SettingsConfirmModal 
    v-model:open="isDeleteModalOpen" mode="delete" title="Delete product"
      :description="'Are you sure you want to delete this product \'' + selectedProduct?.name + '\' ?'"
      :loading="loadingDelete"
      @confirm="selectedProduct && onDeleteProductCategory(selectedProduct.id!)" />
    </ClientOnly>
</template>