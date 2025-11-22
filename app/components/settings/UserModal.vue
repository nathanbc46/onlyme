<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const fileRef = ref<HTMLInputElement>()
const props = withDefaults(defineProps<{
    mode?: 'add' | 'edit',
    user?: {
        id: string
        name: string
        email: string
        role?: string
        image?: string | null | undefined
    } | null,
    title?: string,
    description?: string,
    loading?: boolean
}>(), {
    mode: 'add',
    user: null,
    email: '',
    title: 'Add user',
    description: 'Add a new user',
    loading: false
})

const roleItems = ref(['admin', 'user'])

const baseSchema = {
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
  role: z.string().min(1, 'Role is required'),
  image: z.string().nullable().optional(),
}

// กำหนด schema ตาม mode
const schema = props.mode === 'edit'
  ? z.object(baseSchema) // edit: ไม่มี password
  : z.object({
      ...baseSchema,
      password: z.string().min(8, 'Must be at least 8 characters'),
    })

type Schema = z.output<typeof schema>

// กำหนด state ตาม mode
const state: Schema & { password?: string } = reactive({
  name: props.user?.name ?? '',
  email: props.user?.email ?? '',
  role: props.user?.role ?? 'user',
  image: props.user?.image ?? '',
  ...(props.mode !== 'edit' ? { password: '' } : {}), // add password เฉพาะ create
})

const emit = defineEmits(['submit'])
const open = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    const avatarFile = fileRef.value?.files?.[0]

    // let imageUrl: string | undefined

    // if (avatarFile) {
    //     try {
    //     if (!avatarFile.type.startsWith("image/")) {
    //         throw new Error("Please upload a valid image file(jpg, jpeg, png)")
    //     }
    //     // 👉 อัพโหลดไฟล์ไปที่ API
    //     const formData = new FormData()
    //     formData.append("file", avatarFile)

    //     const uploadRes = await $fetch<{ url: string }>("/api/upload-avatar", {
    //         method: "POST",
    //         body: formData,
    //     })

    //     imageUrl = uploadRes.url // ได้ path เช่น /uploads/xxxx.png
    //     payload.data.image = imageUrl
    //     console.log(imageUrl)
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }
    

    emit('submit', payload.data, avatarFile)
    open.value = false
}

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
    }"
      >
        
        <UButton v-if="props.mode === 'add'" label="Add user" icon="i-lucide-user-plus" color="neutral" class="w-fit lg:ms-auto" />
        <UButton v-else  icon="i-lucide-pencil" color="neutral" class="w-fit lg:ms-auto" size="xs" />

        <template #body>
            <UForm 
            :schema="schema" 
            :state="state" 
            class="space-y-4" 
            @submit="onSubmit">
                <UFormField label="Name" placeholder="John Doe" name="name">
                    <UInput v-model="state.name" autofocus class="w-full" />
                </UFormField>
                <UFormField label="Email" placeholder="john.doe@example.com" name="email">
                    <UInput v-model="state.email" class="w-full" />
                </UFormField>
                <UFormField  v-if="props.mode === 'add'" label="Password" placeholder="••••••••" name="password">
                    <UInput v-model="state.password" class="w-full" type="password" />
                </UFormField>
                <UFormField
                v-if="props.mode === 'edit'"
                name="avatar"
                label="Avatar"
                description="JPG, GIF or PNG."
                class="flex max-sm:flex-col justify-between sm:items-center gap-4"
            >
                <div class="flex flex-wrap items-center gap-3">
                <img 
                    v-if="state.image"
                    :src="state.image ?? undefined" 
                    class="w-12 h-12 rounded-full"
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
                <UFormField label="Role" placeholder="User" name="role">
                    <USelect v-model="state.role" :items="roleItems" :ui="{ value: 'capitalize', item: 'capitalize' }" />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                    <UButton 
                    :label="props.mode === 'add' ? 'Add user' : 'Update'" 
                    :loading="props.loading" color="primary" variant="solid" type="submit" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>