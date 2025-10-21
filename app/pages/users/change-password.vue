<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'

const toast = useToast()
const { changePassword } = useUser()

const passwordSchema = z.object({
    current: z.string().min(8, 'Must be at least 8 characters'),
    new: z.string().min(8, 'Must be at least 8 characters')
})

const show = ref(false)
type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<PasswordSchema>({
    current: '',
    new: ''
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
    const errors: FormError[] = []
    if (state.current && state.new && state.current === state.new) {
        errors.push({ name: 'new', message: 'Passwords must be different' })
    }
    return errors
}

async function onSubmit() {
    try {
        await changePassword(password.current, password.new)
        toast.add({
            title: 'Success',
            description: 'Password updated successfully.',
            color: 'success'
        })
    } catch (error) {
        console.error(error)
        toast.add({
            title: 'Error',
            description: (error as Error).message,
            color: 'error'
        })
    }
}
</script>

<template>
    <UPageCard 
    title="Password" description="Confirm your current password before setting a new one." variant="subtle"
        class="mb-4">
        <UForm 
        :schema="passwordSchema" :state="password" :validate="validate" class="flex flex-col gap-4 max-w-xs"
            @submit="onSubmit">
            <UFormField name="current">
                <UInput v-model="password.current" type="password" placeholder="Current password" class="w-full" />
            </UFormField>

            <UFormField name="new">
                <UInput 
                v-model="password.new" :type="show ? 'text' : 'password'" :ui="{ trailing: 'pe-1' }"
                    placeholder="New password" class="w-full">
                    <template #trailing>
                        <UButton 
                        color="neutral" variant="link" size="sm"
                            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                            :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show"
                            :aria-controls="password.new" @click="show = !show" />
                    </template>
                </UInput>
            </UFormField>

            <UButton label="Update" class="w-fit" type="submit" />
        </UForm>
    </UPageCard>

</template>
