<template>
  <div>
    <!-- Modal (use your modal component, here is a basic structure) -->
    <UDialog v-model="show" :close-on-esc="true" :close-on-click-away="false" max-width="800px">
      <template #title>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">สรุปคำสั่งซื้อ — เลขที่ #{{ order.id }}</h3>
            <p class="text-sm text-gray-500">ลูกค้า: {{ order.customer?.name || '-' }} • {{ formattedDate }}</p>
          </div>
          <div class="flex gap-2">
            <UButton size="sm" variant="outline" icon="i-heroicons-clipboard" @click="copyReceipt">
              คัดลอก
            </UButton>
            <UButton size="sm" variant="outline" icon="i-heroicons-printer" @click="printReceipt">
              ปริ้นใบเสร็จ
            </UButton>
            <UButton size="sm" color="primary" icon="i-heroicons-pencil-square" @click="onEdit">
              แก้ไข
            </UButton>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Left: Receipt preview (what appears on screen and printed) -->
        <div class="p-4">
          <div id="receipt-preview" class="bg-white border rounded p-4 shadow-sm">
            <!-- Receipt header -->
            <div class="text-center mb-3">
              <h4 class="text-xl font-bold">ชื่อร้าน OnlyMe</h4>
              <p class="text-sm">ที่อยู่ร้าน · เบอร์โทร · ข้อมูลเพิ่มเติม</p>
              <p class="mt-2 text-sm text-gray-600">คำสั่งซื้อ #: <strong>{{ order.id }}</strong></p>
              <p class="text-sm text-gray-600">{{ formattedDate }}</p>
            </div>

            <!-- Customer -->
            <div class="mb-3 text-sm">
              <div><strong>ลูกค้า:</strong> {{ order.customer?.name || '-' }}</div>
              <div v-if="order.customer?.phone"><strong>โทร:</strong> {{ order.customer.phone }}</div>
              <div v-if="order.note"><strong>หมายเหตุ:</strong> {{ order.note }}</div>
            </div>

            <!-- Items -->
            <div class="divide-y">
              <div v-for="(item, idx) in order.items" :key="idx" class="py-2 flex justify-between items-start">
                <div class="min-w-0">
                  <div class="font-medium truncate">{{ item.name }}</div>
                  <div class="text-xs text-gray-500">{{ item.variant || '' }}</div>
                </div>
                <div class="text-right">
                  <div>{{ item.qty }} x ฿{{ format(item.price) }}</div>
                  <div class="font-semibold">฿{{ format(item.price * item.qty) }}</div>
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="mt-4 text-sm">
              <div class="flex justify-between py-1">
                <span>รวมย่อย</span>
                <span>฿{{ format(subtotal) }}</span>
              </div>
              <div class="flex justify-between py-1" v-if="order.discount && order.discount > 0">
                <span>ส่วนลด</span>
                <span>-฿{{ format(order.discount) }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span>ภาษี</span>
                <span>฿{{ format(order.tax || 0) }}</span>
              </div>
              <div class="flex justify-between py-2 border-t font-bold text-lg">
                <span>รวมทั้งหมด</span>
                <span>฿{{ format(total) }}</span>
              </div>
            </div>

            <!-- QR / Footer for print -->
            <div class="mt-4 text-center text-sm text-gray-600">
              <div v-if="showQr">
                <!-- Placeholder QR - replace with real QR component or image -->
                <div class="inline-block p-2 border bg-white">
                  <img :src="qrDataUrl" alt="QR" class="w-24 h-24 object-contain" />
                </div>
              </div>
              <p class="mt-2">ขอบคุณที่ใช้บริการ 😊</p>
            </div>
          </div>
        </div>

        <!-- Right: Actions & copy text preview -->
        <div class="p-4 flex flex-col gap-3">
          <div>
            <h5 class="font-semibold mb-2">ข้อความสำหรับส่งลูกค้า</h5>
            <textarea readonly rows="8" class="w-full p-2 border rounded text-sm" :value="receiptText"></textarea>
            <div class="text-xs text-gray-500 mt-2">กด "คัดลอก" เพื่อส่งข้อความนี้ให้ลูกค้าทางแชท</div>
          </div>

          <div class="mt-auto flex gap-2">
            <UButton @click="copyReceipt" class="flex-1">📋 คัดลอกข้อความ</UButton>
            <UButton color="success" @click="printReceipt" class="flex-1">🖨️ ปริ้นใบเสร็จ</UButton>
          </div>

          <div class="text-xs text-gray-500 mt-2">
            ถ้าต้องการแก้ไขคำสั่งซื้อ ให้กด "แก้ไข" ระบบจะนำไปที่หน้าจอแก้ไขหรือเปิด modal แก้ไขตามการตั้งค่าของคุณ
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="close">ปิด</UButton>
          <UButton color="primary" @click="confirmClose">ปิดและกลับหน้าขาย</UButton>
        </div>
      </template>
    </UDialog>

    <!-- Printable area: keep in DOM but visible only to print -->
    <div id="printable-area" class="hidden">
      <div id="printable-receipt" class="print-paper p-6">
        <div class="text-center mb-2">
          <h2 class="text-2xl font-bold">ชื่อร้าน OnlyMe</h2>
          <p class="text-sm">ที่อยู่ร้าน · เบอร์โทร</p>
          <p class="mt-1 text-sm">คำสั่งซื้อ #: <strong>{{ order.id }}</strong></p>
          <p class="text-sm">{{ formattedDate }}</p>
        </div>
        <hr />
        <div class="mt-3 text-sm">
          <div><strong>ลูกค้า:</strong> {{ order.customer?.name || '-' }}</div>
          <div v-if="order.customer?.phone"><strong>โทร:</strong> {{ order.customer.phone }}</div>
          <div v-if="order.note" class="mt-2"><strong>หมายเหตุ:</strong> {{ order.note }}</div>
        </div>

        <table class="w-full mt-3 text-sm">
          <thead>
            <tr>
              <th class="text-left">รายการ</th>
              <th class="text-center">จำนวน</th>
              <th class="text-right">ราคา</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(i, idx) in order.items" :key="idx">
              <td>{{ i.name }}</td>
              <td class="text-center">{{ i.qty }}</td>
              <td class="text-right">฿{{ format(i.price * i.qty) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 text-sm">
          <div class="flex justify-between"><span>รวมย่อย</span><span>฿{{ format(subtotal) }}</span></div>
          <div class="flex justify-between" v-if="order.discount && order.discount > 0"><span>ส่วนลด</span><span>-฿{{ format(order.discount) }}</span></div>
          <div class="flex justify-between"><span>ภาษี</span><span>฿{{ format(order.tax || 0) }}</span></div>
          <div class="flex justify-between mt-2 font-bold text-lg"><span>รวมทั้งหมด</span><span>฿{{ format(total) }}</span></div>
        </div>

        <div class="mt-6 text-center text-sm">
          <div v-if="showQr"><img :src="qrDataUrl" alt="QR" class="mx-auto w-28 h-28" /></div>
          <p class="mt-2">ขอบคุณที่อุดหนุน — ติดต่อ: 012-345-6789</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

/**
 * Props:
 *  - modelValue / v-model for show/hide
 *  - order: object with id, customer, items[], note, discount, tax
 */
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  order: {
    type: Object,
    required: true
  },
  showQr: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'edit', 'close', 'printed'])
const show = ref(props.modelValue)

watch(() => props.modelValue, v => (show.value = v))
watch(show, v => emit('update:modelValue', v))

const close = () => { show.value = false; emit('close') }
const confirmClose = () => { show.value = false; emit('close') }

const format = (v = 0) => {
  return Number(v).toFixed(2)
}

const subtotal = computed(() =>
  (props.order.items || []).reduce((s: number, it: any) => s + (it.price || 0) * (it.qty || 0), 0)
)
const total = computed(() => Math.max(0, subtotal.value - (props.order.discount || 0) + (props.order.tax || 0)))

const formattedDate = computed(() => {
  const d = props.order.createdAt ? new Date(props.order.createdAt) : new Date()
  return d.toLocaleString()
})

// QR placeholder: you can generate via API or library
const qrDataUrl = computed(() => {
  // A data URL placeholder (transparent gif) — replace with real QR generator result
  return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
})

// Build text message for copy
const receiptText = computed(() => {
  const lines: string[] = []
  lines.push(`🧾 คำสั่งซื้อ #${props.order.id}`)
  lines.push(`ลูกค้า: ${props.order.customer?.name || '-'}`)
  if (props.order.customer?.phone) lines.push(`โทร: ${props.order.customer.phone}`)
  lines.push('')
  for (const it of props.order.items || []) {
    lines.push(`• ${it.name} x${it.qty} = ฿${format(it.price * it.qty)}`)
  }
  lines.push('')
  lines.push(`รวมทั้งหมด: ฿${format(total.value)}`)
  lines.push(`วันที่: ${formattedDate.value}`)
  if (props.order.note) lines.push(`หมายเหตุ: ${props.order.note}`)
  return lines.join('\n')
})

const copyReceipt = async () => {
  try {
    await navigator.clipboard.writeText(receiptText.value)
    // you can use a toast instead of alert
    window.alert('คัดลอกเรียบร้อย — พร้อมส่งให้ลูกค้า')
  } catch (e) {
    window.alert('คัดลอกไม่สำเร็จ — กรุณาอนุญาตการใช้งาน clipboard')
  }
}

const printReceipt = () => {
  // Ensure printable DOM is up-to-date: copy preview into printable area if necessary.
  // Show printable area then call print
  const printableArea = document.getElementById('printable-area')
  if (printableArea) {
    printableArea.classList.remove('hidden')
  }
  // Small timeout ensures DOM paint
  setTimeout(() => {
    window.print()
    // Hide printable area after printing
    if (printableArea) printableArea.classList.add('hidden')
    emit('printed', props.order.id)
  }, 200)
}

const onEdit = () => {
  // emit edit event so parent can open edit page/modal
  emit('edit', props.order)
}
</script>

<style scoped>
/* Styles for print */
@media print {
  body * {
    visibility: hidden;
  }
  #printable-receipt,
  #printable-receipt * {
    visibility: visible;
  }
  #printable-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    /* A4 consideration: don't set fixed height here; let print scale */
  }

  /* hide UI modal elements */
  .no-print {
    display: none !important;
  }
}

/* Desktop preview paper styles (optional) */
.print-paper {
  background: white;
  width: 210mm; /* A4 width */
  max-width: 100%;
  margin: 0 auto;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
</style>
