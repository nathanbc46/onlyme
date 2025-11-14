<script setup lang="ts">

const { $supabase } = useNuxtApp() 
const file = ref<File | null>(null)
const fileUrl = ref<string | null>(null)

const uploadFile = async () => {
  if (!file.value) return alert('กรุณาเลือกไฟล์')

  const { data, error } = await $supabase.storage
    .from('onlyme-uploads') // ชื่อ bucket
    .upload(`public/${file.value.name}`, file.value)

  console.log(data, error)

  if (error) return alert(error.message)

  const { data: publicUrl } = $supabase.storage.from('onlyme-uploads').getPublicUrl(`public/${file.value.name}`)
  fileUrl.value = publicUrl.publicUrl
}

function extractPathFromUrl(url: string) {
  const parts = url.split('/onlyme-uploads/')[1]
  return parts // เช่น "public/myphoto.png"
}

const deleteImage = async (path: string) => {
  try {
  const { data, error } = await $supabase.storage
    .from('onlyme-uploads') // ชื่อ bucket
    .remove([path])  // ต้องเป็น array

  console.log(data, error)

  if (error) {
    console.error(error)
    throw new Error(`Cannot delete image at path '${path}'. Error: ${error?.message || 'Unknown error'}`)
  }
  console.log('ลบสำเร็จ', data)    
  } catch (error) {
    console.error(error)
  }

}

function deleteOldImage() {
  const oldImage = 'https://yzuyoeqvfzwzzbdgnnce.supabase.co/storage/v1/object/public/onlyme-uploads/public/age_ri.jpg'
  const path = extractPathFromUrl(oldImage)
  console.log('path',path)
  if (path) {
    deleteImage(path)
  }
}




</script>

<template>
  <div class="p-6 space-y-4">
    <h1 class="text-xl font-bold">📤 Upload to Supabase</h1>
    <input type="file" @change="e => file = (e.target as HTMLInputElement)?.files?.[0] ?? null" >
    <button class="bg-blue-600 text-white px-4 py-2 rounded" @click="uploadFile">
      อัปโหลด
    </button>

    <button class="bg-red-600 text-white px-4 py-2 rounded" @click="deleteOldImage">
      ลบรูปเก่า
    </button>

    <div v-if="fileUrl" class="mt-4">
      <p>✅ Uploaded!</p>
      <a :href="fileUrl" target="_blank" class="text-blue-500 underline">{{ fileUrl }}</a>
      <img :src="fileUrl" alt="" class="mt-2 w-40 rounded shadow" >
    </div>
  </div>
</template>
