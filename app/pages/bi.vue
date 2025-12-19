<template>
  <UDashboardPanel id="Bi Report">
    <!-- 🔹 Header -->
    <template #header>
      <UDashboardNavbar title="Bi Report">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- 🔹 Body -->
    <template #body>

        <iframe title="OnlyMe" style="width: 100%;height: 88%;position: absolute" src="https://app.powerbi.com/reportEmbed?reportId=d3088f0c-6b97-48fb-9518-4370a077e9f0&autoAuth=true&ctid=c8b62176-6982-4c7e-a8dc-3e700b964218" frameborder="0" allowFullScreen="true" />

    </template>
  </UDashboardPanel>
</template>