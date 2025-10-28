<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
const fileRef = ref<HTMLInputElement>()

const props = withDefaults(
  defineProps<{
    open?: boolean
    mode?: 'add' | 'edit'
    title?: string
    description?: string
    product?: {
      id: string
      name: string
      price: number
      image?: string
      category: {
        id: string
        name: string
      }
    } | null,
    categories?: { id: string; name: string }[]
  }>(),
  {
    title: 'Add product',
    description: 'Add a new product',
    product: null,
    mode: 'add',
    categories: () => []
  }
)

const emit = defineEmits(['submit', 'update:open'])

// ✅ ทำ proxy สำหรับ v-model
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})


const schema = z.object({
  name: z.string().min(2, 'Too short'),
  price: z.coerce.number().min(1, 'Must be at least 1'),
  categoryId: z.string(),
  image: z.string().nullable().optional()
})
type Schema = z.input<typeof schema>

const state = reactive({
  name: props.product?.name ?? '',
  price: props.product?.price ?? 0,
  categoryId: props.product?.category?.id ?? '',
  image: props.product?.image ?? ''
})

// sync props.product → state
watch(
  () => props.product,
  (val) => {
    if (val) {
      state.name = val.name
      state.price = val.price
      state.categoryId = val.category?.id ?? ''
      state.image = val.image ?? ''
    }
  },
  { immediate: true }
)

function onSubmit(event: FormSubmitEvent<Schema>) {
  const imageFile = fileRef.value?.files?.[0]
  emit('submit', event.data, imageFile)
}

function closeModal() {
  emit('update:open', false)
}

const loading = ref(false)

const formattedCategories = computed(() =>
  (props.categories || []).map(c => ({
    label: c.name,
    value: String(c.id)
  }))
)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  state.image = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}

//console.log('categories', props.categories)
</script>

<template>
  <UModal v-model:open="isOpen" :title="props.title" :description="props.description" @close="closeModal">
    <template #body>
      <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField name="categoryId" label="Product Category">
          <USelectMenu
            v-model="state.categoryId"
            :items="formattedCategories || []"
            value-key="value"
            searchable
            placeholder="Select category"
          />
        </UFormField>

        <UFormField name="name" label="Product Name">
          <UInput v-model="state.name" />
        </UFormField>

        <UFormField name="price" label="Product Price">
          <UInput v-model.number="state.price" type="number" />
        </UFormField>

        <UFormField
          name="image"
          label="Image"
          description="JPG, GIF or PNG."
          class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
          <div class="flex flex-wrap items-center gap-3">
          <img 
              v-if="state.image"
              :src="state.image ?? undefined" 
              class="h-12"
              :alt="state.name">
          <UButton
              label="Choose"
              color="neutral"
              @click="onFileClick"
          />
          <input
              ref="fileRef"
              type="file"
              class="hidden"
              accept=".jpg, .jpeg, .png, .gif"
              @change="onFileChange"
          >
          </div>
      </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="closeModal" />
          <UButton :label="props.mode === 'add' ? 'Add Product' : 'Update'" type="submit" :loading="loading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
