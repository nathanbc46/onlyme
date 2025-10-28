<script setup lang="ts">
import { debounce } from 'lodash-es' // debounce คือ การ delays การทํางานของ function
const { start, finish } = useLoadingIndicator()

const pageSize = 1000;
const currentPage = 1;
const toast = useToast()

interface User {
  id: string
  name: string
  email: string
  role?: string
  image?: string | null | undefined
}

interface UserCreate {
  name: string
  email: string
  password: string
  role?: 'user' | 'admin' | ('user' | 'admin')[]
  image?: string | null | undefined
}

const data = ref<User[]>([]) // ✅ เริ่มต้นเป็น array เปล่า
const q = ref<string>()
const loading = ref(false)
const error = ref<Error | null>(null)


async function listUsers() {
  try {
    start({ force: true }) // เริ่มโหลดทุกครั้งที่เปลี่ยน route
    loading.value = true
    error.value = null
    const users = await authClient.admin.listUsers({
      query: {
        searchValue: q.value,
        searchField: "name",
        searchOperator: "contains",
        sortBy: "name",
        sortDirection: "asc",
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      }
    })

    // const { data } = await useFetch<{ user: User[]}>('/api/users')
    // console.log(data.value?.user)

    // ✅ ป้องกัน null/undefined จาก response
    if (Array.isArray(users.data?.users)) {
      data.value = users.data?.users as User[]
    } else {
      data.value = [] // fallback
    }

  } catch (err) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (err as Error).message || 'Failed to fetch users',
      color: 'error'
    })
    data.value = [] // ✅ fallback กรณี error
    error.value = err as Error
  } finally {
    loading.value = false
  }

  finish()
}

onMounted(() => {
  listUsers()
})


async function onCreateUser(user: UserCreate) {
  try {
    const { data: newUser, error } = await authClient.admin.createUser(user)
    toast.add({
      title: 'Success',
      description: 'User created successfully',
      color: 'success'
    })

    if (error) throw error
    data.value.push({
      id: newUser.user.id,
      name: newUser.user.name,
      email: newUser.user.email,
      role: newUser.user.role,
      image: newUser.user.image
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: (error as Error).message || 'Failed to create user',
      color: 'error'
    })
  }
}

function onUpdateUser(user: User) {
  const index = data.value.findIndex((item) => item.id === user.id)
  if (index === -1) return // ถ้าไม่เจอ id เดียวกันก็ไม่ทำอะไร

  // อัปเดตข้อมูล
  data.value[index] = user
}

function onRemoveUser(id: string) {
  const index = data.value.findIndex((item) => item.id === id)
  if (index === -1) return // ถ้าไม่เจอ id เดียวกันก็ไม่ทำอะไร

  // อัปเดตข้อมูล
  data.value.splice(index, 1)
}

watch(q, debounce(listUsers, 500)) // ดูว่า userId มีการเปลี่ยนแปลงหรือไม่ ถ้ามีการเปลี่ยนแปลงให้ใช้ debounce delay และให้เรียกใช้ fetchUser

</script>
<template>
  <div>
    <UPageCard 
    title="Users" description="Manage users who can access System." variant="naked" orientation="horizontal"
      class="mb-4">
      <SettingsUserModal 
      mode="add" title="Add user" description="Add a new user"
        @submit="onCreateUser" />
    </UPageCard>

    <UPageCard 
    variant="subtle"
      :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
      <template #header>
        <UInput v-model="q" icon="i-lucide-search" placeholder="Search users" autofocus class="w-full" :ui="{ trailing: 'pe-1' }" >
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
      <div v-if="error" class="p-4 text-error">Error: {{ error?.message }}</div>
      <SettingsUsersList :users="data || []" :loading-data=loading  @update-user="onUpdateUser" @remove-user="onRemoveUser"/>
    </UPageCard>
  </div>
</template>
