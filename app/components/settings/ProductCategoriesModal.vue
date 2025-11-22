<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = withDefaults(defineProps<{
    loadingSubmit?: boolean,
    mode?: 'add' | 'edit',
    title?: string,
    description?: string,
    name?: string
}>(), {
    mode: 'add',
    title: 'Add product category',
    description: 'Add a new product category',
    name: '',
    loadingSubmit: false
})

const schema = z.object({
    name: z.string().min(2, 'Too short').optional()
})

type Schema = z.output<typeof schema>

const state: Schema = reactive({
    name: props.name
})

const open = ref(false)

const emit = defineEmits(['submit'])

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    try {
        emit('submit', payload.data)
        open.value = false
    } catch (error) {
        console.error(error)
    }
}
</script>
<template>
    <UModal 
    v-model:open="open" 
    :title="props.title" 
    :description="props.description"
    :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full'
      }">

        <UButton v-if="props.mode === 'add'" label="Add Product Category" icon="i-lucide-plus" color="neutral" class="w-fit lg:ms-auto" />
        <UButton v-else icon="i-lucide-pencil" color="neutral" class="w-fit lg:ms-auto" size="xs" />

        <template #body>
            <UForm :schema="schema" :state="state" class="flex flex-col gap-4 " @submit="onSubmit">
                <UFormField name="name" label="Category Name">
                    <UInput v-model="state.name" autofocus class="w-full" />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                    <UButton :label="props.mode === 'add' ? 'Add Category' : 'Update'"  class="w-fit" :loading="loadingSubmit" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>