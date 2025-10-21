<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
const { signin } = useUser()
const toast  = useToast()

definePageMeta({
  layout: 'blank'
})

interface AuthFormField {
  name: string
  type: 'text' | 'email' | 'password' | 'checkbox'
  label: string
  placeholder?: string
  required?: boolean
}

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'rememberMe',
  label: 'Remember me',
  type: 'checkbox'
}]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters'),
  rememberMe: z.boolean().optional()
})

type Schema = z.output<typeof schema>

const loading = ref(false)
async function onSignIn(payload: FormSubmitEvent<Schema>) {
  try {
    loading.value = true
    const data = await signin(payload.data.email, payload.data.password, payload.data.rememberMe)
    toast.add({
      title: 'Success',
      icon: 'i-lucide-check',
      description: 'You are now logged in. Welcome (' + data.user.name + ')',
      color: 'success'
    })
    await navigateTo('/')
  } catch (error) {
    toast.add({
      title: 'Error',
      icon: 'i-lucide-alert-triangle',
      description: (error as Error).message,
      color: 'error'
    })
  }
  loading.value = false
}
</script>
<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 pt-12 min-h-screen bg-gray-50 dark:bg-gray-900">
    <UPageCard class="w-full max-w-md">
      <UAuthForm 
  :schema="schema"
  title="Login"
  description="Enter your credentials to access your account."
  icon="i-lucide-user"
  :fields="fields"
  :loading="loading"
  @submit="onSignIn" />
    </UPageCard>
  </div>
</template>