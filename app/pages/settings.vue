<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [[{
  label: 'Products',
  icon: 'i-lucide-package',
  to: '/settings/products/',
}, {
  label: 'Product Categories',
  icon: 'i-lucide-boxes',
  to: '/settings/product-categories/',
}, {
  label: 'Users',
  icon: 'i-lucide-users',
  to: '/settings/users/',
  exact: true
}
]
// ,[{
//   label: 'Documentation',
//   icon: 'i-lucide-book-open',
//   to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
//   target: '_blank'
// }]
] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-3xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
