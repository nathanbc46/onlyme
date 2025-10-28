<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user } = useUser()
const open = ref(false)
const currentRole = user.value?.role 

const links: NavigationMenuItem[][] = [[{
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
    onSelect: () => {
        open.value = false
    },
}, {
  label: 'Orders Food',
  icon: 'i-lucide-salad',
  to: '/orders-food',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Customers',
  icon: 'i-lucide-users',
  to: '/customers',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Reports',
  icon: 'i-lucide-chart-bar',
  to: '/reports',
  onSelect: () => {
    open.value = false
  }
}
]] 

if (currentRole === 'admin') {
    links[0]?.push({
        label: 'Settings',
        to: '/settings',
        icon: 'i-lucide-settings',
        defaultOpen: true,
        type: 'trigger',
        children: [
            { label: 'Products', to: '/settings/products', icon: 'i-lucide-package', onselect: () => { open.value = false } },
            { label: 'Product Categories', to: '/settings/product-categories', icon: 'i-lucide-boxes', onselect: () => { open.value = false } },
            { label: 'Users', to: '/settings/users/', icon: 'i-lucide-users', onselect: () => { open.value = false } },
        ]
    })
}

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

                <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" tooltip popover />

            </template>

            <template #footer="{ collapsed }">
                <UserMenu :collapsed="collapsed" />
            </template>
        </UDashboardSidebar>

        <slot />

    </UDashboardGroup>
</template>
