<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const { user } = useUser()

const open = ref(true)

const links = computed(() => {
    const currentRole = user.value?.role 

    // --- แก้ไขตรงนี้ ---
    // ระบุ Type ให้กับตัวแปรอาร์เรย์
    const menuItems: NavigationMenuItem[] = [
        { label: 'Home', icon: 'i-lucide-home', to: '/' },
        //{ label: 'Users', icon: 'i-lucide-users', to: '/users' },
    ]

    if (currentRole === 'admin') {
        // เมื่อ push ตอนนี้ TypeScript จะตรวจสอบทันทีว่าตรง Type หรือไม่
        menuItems.push({
            label: 'Settings',
            icon: 'i-lucide-settings',
            defaultOpen: true,
            type: 'trigger', // ไม่ต้องใช้ as const แล้ว เพราะ Type ถูกคุมจาก menuItems
            children: [
                { label: 'Users', to: '/settings/users/', icon: 'i-lucide-users', onselect: () => { open.value = false } },
                { label: 'Products Categories', to: '/settings/product-categories', icon: 'i-lucide-boxes', onselect: () => { open.value = false } }
            ]
        })
    }

    return [menuItems] satisfies NavigationMenuItem[][]
})

</script>
<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar 
        id="default" v-model:open="open" collapsible resizable class="bg-elevated/25"
            :ui="{ footer: 'lg:border-t lg:border-default' }">
            <template #header="{ collapsed }">
                <!-- <TeamsMenu :collapsed="collapsed" /> -->
                <h1 v-if="!collapsed" class="text-lg font-medium">OnlyMe</h1>
                <UIcon v-else name="i-lucide-layout-dashboard" class="size-5 text-primary mx-auto" />
            </template>

            <template #default="{ collapsed }">
                <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" popover />
            </template>
            <template #footer="{ collapsed }">
                <UserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>

        <slot />

    </UDashboardGroup>
</template>