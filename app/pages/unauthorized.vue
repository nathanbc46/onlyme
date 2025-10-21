<script setup lang="ts">
    definePageMeta({
        layout: 'blank'
    })
</script>
<template>
  <UError
    :clear="{
      color: 'neutral',
      size: 'xl',
      icon: 'i-lucide-arrow-left',
      class: 'rounded-full'
    }"
    :error="{
      statusCode: 401,
      statusMessage: 'Access Denied',
      message: 'You do not have permission to access this page.'
    }"
  />
</template>