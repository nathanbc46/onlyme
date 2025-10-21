<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { user, updateUser } = useUser()
const { start, finish } = useLoadingIndicator()
const fileRef = ref<HTMLInputElement>()

const profileSchema = z.object({
  name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
  avatar: z.string().nullable().optional(),
})

type ProfileSchema = z.output<typeof profileSchema>

const profile = reactive<Partial<ProfileSchema>>({
  name: user.value?.name,
  email: user.value?.email,
  avatar: user.value?.image,
})
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  start({ force: true }) // เริ่มโหลดทุกครั้งที่เปลี่ยน route
  const avatarFile = fileRef.value?.files?.[0]

  let imageUrl: string | undefined

  if (avatarFile) {
    try {
      if (!avatarFile.type.startsWith("image/")) {
          throw new Error("Please upload a valid image file(jpg, jpeg, png)")
      }
      // 👉 อัพโหลดไฟล์ไปที่ API
      const formData = new FormData()
      formData.append("file", avatarFile)

      const uploadRes = await $fetch<{ url: string }>("/api/upload-avatar", {
          method: "POST",
          body: formData,
      })

      imageUrl = uploadRes.url // ได้ path เช่น /uploads/xxxx.png
      if(imageUrl) {
        profile.avatar = imageUrl
      }
      console.log(imageUrl)
    } catch (error) {
      console.error(error)
      toast.add({
        title: 'Error',
        description: (error as Error).message,
        icon: 'i-lucide-alert-triangle',
        color: 'error'
      })
    }
  }

  try {
    const data = await updateUser(event.data.name, imageUrl)
    if (data) {
      toast.add({
        title: 'Success',
        description: 'Your settings have been updated.',
        icon: 'i-lucide-check',
        color: 'success'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as Error).message,
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    return
  }

  finish()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  profile.avatar = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      title="Profile"
      description="These informations will be displayed publicly."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        label="Save changes"
        color="neutral"
        type="submit"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="email"
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.email"
          type="email"
          autocomplete="off"
          disabled
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="profile.name"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />

      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF or PNG."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <!-- <UAvatar
            :src="profile.avatar ?? undefined"
            :alt="profile.name"
            size="xl"
          /> -->
          <img 
            v-if="profile.avatar"
            :src="profile.avatar ?? undefined" 
            class="w-12 h-12 rounded-full"
            :alt="profile.name">
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
    </UPageCard>
  </UForm>
</template>