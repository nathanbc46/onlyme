<script setup lang="ts">
// import { it } from 'node:test'
import { ref, computed, watch } from 'vue'
const toast = useToast()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  order: { type: Object, required: true },
  showQr: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'edit', 'close', 'printed'])
const show = ref(props.modelValue)

watch(() => props.modelValue, v => (show.value = v))
watch(show, v => emit('update:modelValue', v))

const close = () => { show.value = false; emit('close') }
const confirmClose = () => { show.value = false; emit('close') }

const format = (v = 0) => Number(v).toFixed(0)

/* const subtotal = computed(() =>
  (props.order.items || []).reduce((s: number, it: any) => s + (it.price || 0) * (it.qty || 0), 0)
)
const total = computed(() => Math.max(0, subtotal.value - (props.order.discount || 0) + (props.order.tax || 0))) */

const formattedDate = computed(() => {
  const d = props.order.createdAt ? formatDateTime(props.order.createdAt) : new Date()
  return d
})

// const qrDataUrl = computed(() => 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==')

const receiptText = computed(() => {
  const lines: string[] = []
  //lines.push(`🧾 คำสั่งซื้อ #${props.order.id}`)
  lines.push(`ลูกค้า: คุณ ${props.order.customer?.name || '-'}`)
  //if (props.order.customer?.phone) lines.push(`โทร: ${props.order.customer.phone}`)
  //lines.push('')
  for (const it of props.order.orderItems || []) {
    const remark = it?.remark ? ` ${it.remark}` : ''
    lines.push(`• ${it.product.name} ${remark} x${it.quantity} = ฿${format(it.price * it.quantity)}`)
  }
  lines.push('___________________')
  lines.push(`รวมทั้งหมด: ฿${format(props.order.totalAmount)}`)
  //lines.push(`วันที่: ${formattedDate.value}`)
  if (props.order.remark) lines.push(`หมายเหตุ: ${props.order.remark}`)
  return lines.join('\n')
})

const copyReceipt = async () => {
  try {
    await navigator.clipboard.writeText(receiptText.value)
    toast.add({
      title: 'คัดลอกเรียบร้อย',
      description: 'คัดลอกเรียบร้อย — พร้อมส่งให้ลูกค้า',
      color: 'success',
      icon: 'i-heroicons-clipboard-document-check'
    })
    // alert('คัดลอกเรียบร้อย — พร้อมส่งให้ลูกค้า')
  } catch {
    toast.add({
      title: 'คัดลอกไม่สำเร็จ',
      description: 'คัดลอกไม่สำเร็จ — กรุณาอนุญาตการใช้งาน clipboard',
      color: 'error',
      icon: 'i-lucide-clipboard-x'
    })
    // alert('คัดลอกไม่สำเร็จ — กรุณาอนุญาตการใช้งาน clipboard')
  }
}

const printReceipt = () => {
  const printableArea = document.getElementById('printable-area')
  if (!printableArea) return

  // ให้แน่ใจว่าพื้นที่นี้มองเห็นก่อนสั่ง print
  printableArea.classList.add('print-visible')

  // ใช้เวลา delay นิดหน่อยให้ DOM วาดเสร็จ
  setTimeout(() => {
    window.print()
    printableArea.classList.remove('print-visible')
    emit('printed', props.order.id)
  }, 200)
}


// const onEdit = () => emit('edit', props.order)
</script>

<template>
  <div>
    <!-- Modal -->
    <UModal :title="`สรุปคำสั่งซื้อ — ${ order.orderNumber }`" :description="`ลูกค้า: ${ order.customer?.name || '-' } • ${ formattedDate }`" :open="show" size="lg" :close="{ onClick : close }" >

      <template #body>
        <!-- 
        <div class="flex items-end justify-between w-full">
          <div>
            <h3 class="text-lg font-semibold">สรุปคำสั่งซื้อ — #{{ order.orderNumber }}</h3>
            <p class="text-sm text-gray-500">ลูกค้า: {{ order.customer?.name || '-' }} • {{ formattedDate }}</p>
          </div>
          <div></div>
          <div class="flex gap-2 items-end">
            <UButton size="sm" variant="outline" icon="i-lucide-copy" @click="copyReceipt">คัดลอก</UButton>
            <UButton size="sm" variant="outline" icon="i-heroicons-printer" @click="printReceipt">ปริ้น</UButton>
            <UButton size="sm" color="primary" icon="i-heroicons-pencil-square" @click="onEdit">แก้ไข</UButton>
          </div>
        </div>
        -->


        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Receipt Preview -->

          <!-- Copy text -->
          <div class="p-4 flex flex-col gap-3">
            <h5 class="font-semibold">ข้อความสำหรับลูกค้า</h5>
            <textarea readonly rows="8" class="w-full p-2 border rounded text-sm" :value="receiptText" />
          </div>
          
          <div class="p-4">
            <!-- ✅ พื้นที่พิมพ์เฉพาะใบเสร็จ -->
              <h5 class="font-semibold">ข้อความสำหรับพิมพ์</h5>
            <div id="printable-area" class="bg-white text-gray-900">
              <div class="flex justify-between text-xs items-center font-bold  border-b border-black w-full">
                <span>(OnlyMe)</span>
                <span>คุณ : {{ order.customer?.name }}</span>
                <!-- <p class="text-xs">ที่อยู่ร้าน · เบอร์โทร · ข้อมูลเพิ่มเติม</p>
                <p class="text-xs mt-2">คำสั่งซื้อ #: {{ order.id }}</p>
                <p class="text-xs text-gray-500">{{ formattedDate }}</p> -->
              </div>

              <div class="text-xs">
                <div v-for="(item, i) in order.orderItems" :key="i" class="py-0 flex justify-between">
                  <div>
                    <div class="font-medium">{{ item.product.name }}{{ item?.remark }}</div>
                  </div>
                  <div class="text-right">
                    <div>{{ item.quantity }}×{{ format(item.price) }} = {{ format(item.price * item.quantity) }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-1 text-xs">
                <!-- <div class="flex justify-between"><span>รวมย่อย</span><span>฿{{ format(subtotal) }}</span></div>
                <div class="flex justify-between" v-if="order.discount"><span>ส่วนลด</span><span>-฿{{
                  format(order.discount) }}</span></div>-->
                <div v-if="order.remark" class="flex justify-between">
                  <span></span><span>**{{order.remark}}**</span>
                </div> 
                <div class="flex justify-between border-t font-bold"><span>รวมทั้งหมด</span><span>฿{{
                  format(order.totalAmount) }}</span></div>
              </div>

              <!-- <div v-if="showQr" class="mt-1 text-center">
                <img :src="qrDataUrl" class="w-24 h-24 mx-auto" />
              </div> -->
              <!-- <p class="text-center text-sm text-gray-500 mt-2">ขอบคุณที่ใช้บริการ 😊</p> -->
            </div>
          </div>


        </div>
        <div class="grid gap-4">
          <div class="text-xs text-gray-500">
            กด "คัดลอก" เพื่อส่งให้ลูกค้าทางแชท
          </div>
          <div class="mt-auto flex gap-2">
            <UButton
              class="flex-1 flex items-center justify-center gap-2"
              color="neutral"
              @click="copyReceipt"
            >
              <UIcon name="i-lucide-copy" /> <span>คัดลอก</span>
            </UButton>
            <UButton
              class="flex-1 flex items-center justify-center gap-2"
              color="success"
              @click="printReceipt"
            >
              <UIcon name="i-heroicons-printer" /> <span>ปริ้น</span>
            </UButton>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <!-- <UButton variant="ghost" @click="close">ปิด</UButton> -->
          <UButton color="primary" @click="confirmClose"><UIcon name="i-lucide-x" />ปิดและกลับหน้าขาย</UButton>
        </div>
      </template>
    </UModal>

  </div>
</template>

<!-- ✅ ใช้ CSS global (อย่าใส่ scoped) -->
<style>
@media print {
  @page {
    size: 50mm auto;
    margin: 0 !important;
    padding: 0 !important;
  }

  body * {
    visibility: hidden !important;
  }

  #printable-area,
  #printable-area * {
    visibility: visible !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  #printable-area {
    position: absolute !important;
    left: 0;
    top: 0;
    width: 100% !important;
    overflow: visible !important;
  }
}
</style>
