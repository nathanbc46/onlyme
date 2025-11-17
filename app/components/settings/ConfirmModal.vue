<script lang="ts" setup>
/* defineProps<{
    title: string,
    description: string
}>()

const emit = defineEmits(['confirm'])

function onClick() {
    emit('confirm')
    open.value = false
}
    
const open = ref(false) */

const props = defineProps<{
  loading?: boolean
  open?: boolean
  title: string
  description: string
  btnText?: string
  btnColor?: "error" | "info" | "neutral" | "primary" | "secondary" | "success" | "warning"
}>()


const emit = defineEmits(['confirm', 'update:open'])

function onClick() {
    emit('confirm')
    isOpen.value = false
}

// ✅ ทำ proxy สำหรับ v-model
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

function closeModal() {
  emit('update:open', false)
}


</script>
<template>
    <UModal v-model:open="isOpen" :title="title" :description="description">
        <!-- <slot name="button">
            <UButton color="error" variant="subtle" size="xs" icon="i-lucide-trash" @click="open = true" />
        </slot> -->
        <template #body>
            <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="subtle" @click="closeModal" />
                <UButton :label="btnText ?? `Confirm`" class="w-fit" :color="btnColor ?? `error`" :loading="loading" @click="onClick()" />
            </div>
        </template>
    </UModal>
</template>