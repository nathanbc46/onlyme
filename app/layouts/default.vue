<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const open = ref(true)

const links = [
    [
        { label: 'Home', icon: 'i-lucide-home', to: '/' },
        //{ label: 'Users', icon: 'i-lucide-users', to: '/users' },
        {
            label: 'Settings',
            icon: 'i-lucide-settings',
            //to: '/settings',
            defaultOpen: true,
            type: 'trigger',
            children: [
                { label: 'Users', to: '/settings/users/', icon: 'i-lucide-users', onselect: () => { open.value = false } }
            ]
        },
    ],
] satisfies NavigationMenuItem[][]

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