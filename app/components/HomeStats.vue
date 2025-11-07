<script lang="ts" setup>

const props = defineProps<{
    stats? : {
        icon: string,
        title: string
        value: string | number
        variation: number  
        bg?: string      
    }[],
    pending?: boolean
}>()

</script>
<template>
      <div v-if="pending">
        <UIcon name="i-lucide-loader" spin /> Loading ...
      </div>
      <UPageGrid v-else class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
        <UPageCard
          v-for="(stat, index) in props.stats"
          :key="index"
          :icon="stat.icon"
          :title="stat.title"
          to="/reports"
          variant="subtle"
          :ui="{
            container: 'gap-y-1.5',
            wrapper: 'items-start',
            leading: 'p-2.5 rounded-full bg-'+stat.bg+'/10 ring ring-inset ring-'+stat.bg+'/25 flex-col',
            leadingIcon: 'text-'+stat.bg,
            title: 'font-normal text-muted text-xs uppercase'
          }"
          class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl font-semibold text-highlighted">
              {{ stat.value }} 
            </span>

            <UBadge
              v-if="stat.variation !== null && stat.variation !== 0"
              :color="stat.variation > 0 ? 'success' : 'error'"
              variant="subtle"
              class="text-xs"
            >
              {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation.toFixed(1) }}%
            </UBadge>
          </div>
        </UPageCard>
      </UPageGrid>
</template>