<script setup lang="ts">
const { start, finish } = useLoadingIndicator()
const router = useRouter()

router.beforeEach(() => {
  start({ force: true }) // เริ่มโหลดทุกครั้งที่เปลี่ยน route
})

router.afterEach(() => {
  finish() // ปิดเมื่อโหลดเสร็จ
})

await callOnce(async () =>{
  const { getCurrentUser } = useUser()
  await getCurrentUser()
})
</script>
<template>
  <div>
    <UApp>
      <ClientOnly>
        <NuxtLoadingIndicator />
      </ClientOnly>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>