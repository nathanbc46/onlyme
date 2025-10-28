<script setup lang="ts">
const { start, finish } = useLoadingIndicator()
const router = useRouter()

const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

router.beforeEach(() => {
  start({ force: true }) // เริ่มโหลดทุกครั้งที่เปลี่ยน route
})

router.afterEach(() => {
  finish() // ปิดเมื่อโหลดเสร็จ
})

await callOnce(async () => {
  const { getCurrentUser } = useUser()
  await getCurrentUser()
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Only Me - Tam Ka Yam'
const description = 'Only Me - Tam Ka Yam'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  // ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  // twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/dashboard-light.png',
  // twitterCard: 'summary_large_image'
})
</script>
<template>

  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>

</template>