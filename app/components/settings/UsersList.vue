<script setup lang="ts">
import type { DropdownMenuItem, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { start, finish } = useLoadingIndicator()
const toast = useToast()

const schema = z.object({
  password: z.string('Password is required').min(8, 'Must be at least 8 characters'),
})

type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({
  password: '',
})


interface User {
  id: string
  name: string
  email: string
  role?: string
  image?: string | null | undefined
  banned?: boolean | null | undefined
}

const props = defineProps<{
  users: User[]
  loadingData?: boolean
}>()

interface UserUpdate {
  name: string
  email: string
  role?: 'user' | 'admin' | ('user' | 'admin')[]
  banned?: boolean | null | undefined
  image?: string | null | undefined
}

const loading = ref(false)

const userIdReset = ref('')
const userNameReset = ref('')
const userIdRemove = ref('')
const userNameRemove = ref('')
const userIdBan = ref('')
const userNameBan = ref('')

const emit = defineEmits(['update-user', 'remove-user'])

async function onUpdateUser(oldImage: string | null | undefined, id: string, user: UserUpdate, avatarFile: File | null) {

  let imageUrl: string | undefined

  if (avatarFile) {
    try {
      if (!avatarFile.type.startsWith("image/")) {
        throw new Error("Please upload a valid image file(jpg, jpeg, png)")
      }
      // 👉 อัพโหลดไฟล์ไปที่ API
      const formData = new FormData()
      formData.append("file", avatarFile)
      formData.append("oldImage", oldImage || '' )

      const uploadRes = await $fetch<{ url: string }>("/api/upload-avatar-id", {
        method: "POST",
        body: formData,
      })

      //console.log(uploadRes)

      imageUrl = uploadRes.url // ได้ path เช่น /uploads/xxxx.png
      //console.log(imageUrl)
    } catch (error) {
      console.error(error)
    }
  }

  try {
    loading.value = true
    start({ force: true })

    const { data, error } = await authClient.admin.updateUser({
      userId: id, // required
      data: { name: user.name, email: user.email, role: user.role, image: imageUrl }, // required
    });

    if (error) throw error

    emit('update-user', data)
    toast.add({
      title: 'Success',
      description: 'User updated successfully. (' + data.name + ')',
      color: 'success'
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to update user',
      color: 'error'
    })
  }

  loading.value = false
  finish()
}

async function onSetUserPassword(payload: FormSubmitEvent<Schema>) {
  if (!userIdReset.value) return
  try {
    loading.value = true
    start({ force: true })
    const { error } = await authClient.admin.setUserPassword({
      newPassword: payload.data.password, // required
      userId: userIdReset.value, // required
    });

    if (error) throw error

    toast.add({
      title: 'Success',
      description: 'Password updated successfully.',
      color: 'success'
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to update user',
      color: 'error'
    })
  }

  userIdReset.value = ''
  userNameReset.value = ''
  openModal.value = false

  loading.value = false
  finish()
}

async function onDeleteUser() {
  if (!userIdRemove.value) return
  try {
    loading.value = true
    start({ force: true })
    const { error } = await authClient.admin.removeUser({
      userId: userIdRemove.value, // required
    });

    if (error) throw error

    emit('remove-user', userIdRemove.value)
    toast.add({
      title: 'Success',
      description: 'User deleted successfully.',
      color: 'success'
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to delete user',
      color: 'error'
    })
  }

  openModalRemove.value = false
  userIdRemove.value = ''
  loading.value = false
  finish()
}

async function onBanUser() {
  if (!userIdBan.value) return
  try {
    loading.value = true
    start({ force: true })

    const userDataItem = props.users.find((item: User) => item.id === userIdBan.value)

    if (!userDataItem) return

    if (userDataItem.banned) {
      const { data, error } = await authClient.admin.unbanUser({
        userId: userIdBan.value, // required
      });

      if (error) throw error

      emit('update-user', data.user)
      toast.add({
        title: 'Success',
        description: 'User Unbanned successfully.',
        color: 'success'
      })

    } else {
      const { data, error } = await authClient.admin.banUser({
        userId: userIdBan.value, // required
      });
      if (error) throw error

      emit('update-user', data.user)
      toast.add({
        title: 'Success',
        description: 'User banned successfully.',
        color: 'success'
      })
    }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to ban user',
      color: 'error'
    })
  }

  openModalBan.value = false
  userIdBan.value = ''
  loading.value = false
  finish()
}

async function onRoleChange(id: string, role: "user" | "admin" | ("user" | "admin")[]) {
  if (!id || !role) return
  try {
    const { data, error } = await authClient.admin.setRole({
      userId: id,
      role: role, // required
    });

    if (error) throw error

    emit('update-user', data.user)
    toast.add({
      title: 'Success',
      description: 'Role updated successfully.',
      color: 'success'
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to update user',
      color: 'error'
    })
  }
}

const openModal = ref(false)
const openModalRemove = ref(false)
const openModalBan = ref(false)
const show = ref(false)

const items = (userId: string, userName: string) => [{
  label: 'Reset password',
  icon: 'i-lucide-key',
  onSelect: () => {
    openModal.value = true
    userIdReset.value = userId
    userNameReset.value = userName
  }
}, {
  label: 'Ban user / Unban user',
  color: 'warning' as const,
  icon: 'i-lucide-ban',
  onSelect: () => {
    openModalBan.value = true
    userIdBan.value = userId
    userNameBan.value = userName
  }
}, {
  label: 'Remove user',
  icon: 'i-lucide-trash',
  color: 'error' as const,
  onSelect: () => {
    openModalRemove.value = true
    userIdRemove.value = userId
    userNameRemove.value = userName
  }
}] satisfies DropdownMenuItem[]

</script>

<template>
  <ClientOnly>
    <div v-if ="loadingData" class="p-4 text-muted italic"><UIcon name="i-lucide-loader" class="animate-spin" /> Loading...</div>
    <ul v-else-if="users.length" role="list" class="divide-y divide-default">
      <li v-for="(user, index) in users" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
        <div class="flex items-center gap-3 min-w-0">
          <img 
          v-if="user.image" v-bind="user.image ? { src: user.image } : {}" size="md"
            class="rounded-full w-10 h-10">
          <UAvatar v-else :src="undefined" :alt="user.name" size="xl" />

          <div class="text-sm min-w-0">
            <p class="text-highlighted font-medium truncate">
              {{ user.name }} <UBadge v-if="user.banned" color="error" variant="outline">(banned)</UBadge>
            </p>
            <p class="text-muted truncate">
              {{ user.email }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <USelect 
          :model-value="user.role" :items="['admin', 'user']" color="neutral"
            :ui="{ value: 'capitalize', item: 'capitalize' }"
            @update:model-value="val => onRoleChange(user.id, val as 'user' | 'admin')" />

          <UDropdownMenu :items="items(user.id, user.name)" :content="{ align: 'end' }">
            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
          </UDropdownMenu>

          <SettingsUserModal 
          :key="user.id" mode="edit" :title="`Edit : ${user.name}`" description="Edit user details"
            :user="user" :loading="loading" @submit="(data, avatarFile) => onUpdateUser(user.image, user.id, data, avatarFile)" />
        </div>
      </li>

    </ul>

    <div v-else class="p-4 text-muted italic">
      No users
    </div>
  </ClientOnly>

  <UModal 
  v-model:open="openModal" :title="' Reset password for : ' + userNameReset"
    description="Are you sure you want to reset the password for this user?"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full'
      }">
    <template #body>
      <UForm :schema="schema" :state="state" class="flex flex-col gap-4 " @submit="onSetUserPassword">
        <UFormField name="password">
          <UInput 
          v-model="state.password" :type="show ? 'text' : 'password'" :ui="{ trailing: 'pe-1' }"
            placeholder="New password" class="w-full">

            <template #trailing>
              <UButton 
              color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show" @click="show = !show" />
            </template>
          </UInput>
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="openModal = false" />
          <UButton label="Update" class="w-fit" :loading="loading" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>

  <UModal 
    v-model:open="openModalRemove" 
    :title="' Delete user : ' + userNameRemove"
    description="Are you sure you want to delete this user?" 
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
    @confirm="onDeleteUser()"
      >

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="subtle" @click="openModalRemove = false" />
        <UButton label="Delete" class="w-fit" color="error" :loading="loading" @click="onDeleteUser()" />
      </div>
    </template>

  </UModal>

  <UModal 
  v-model:open="openModalBan" :title="' Ban/Unban user : ' + userNameBan"
    description="Are you sure you want to ban/unban this user?"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
     @confirm="onDeleteUser()">

    <template #body>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" color="neutral" variant="subtle" @click="openModalBan = false" />
        <UButton label="Ban/Unban" class="w-fit" color="warning" :loading="loading" @click="onBanUser()" />
      </div>
    </template>

  </UModal>
</template>
