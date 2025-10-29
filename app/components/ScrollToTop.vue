<template>
  <transition name="fade">
    <button
      v-show="visible"
      class="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition"
      @click="scrollToTop"
    >
      <UIcon name="i-heroicons-arrow-up" />
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

const checkScroll = () => {
  visible.value = window.scrollY > 200 // ปรับความสูงในการแสดงปุ่ม
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
