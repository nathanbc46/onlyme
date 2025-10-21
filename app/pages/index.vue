<script setup lang="ts">
    const { user } = useUser()
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
         <!-- <UDashboardSearch /> -->
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      Welcome : {{ user?.name }}
    </template>
  </UDashboardPanel>
</template>