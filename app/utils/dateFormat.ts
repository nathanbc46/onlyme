import dayjs from 'dayjs'
import 'dayjs/locale/th.js'  // โหลด locale ไทย

export function formatDate(date: Date) {
    dayjs.locale('th') // ตั้งค่าให้ใช้ภาษาไทย
    return dayjs(date).format('DD MMM YYYY')
}

export function formatDateTime(date: Date) {
    dayjs.locale('th') // ตั้งค่าให้ใช้ภาษาไทย
    return dayjs(date).format('DD/MMM/YYYY HH:mm')
}

export function formatMonth(date: Date) {
    dayjs.locale('th') // ตั้งค่าให้ใช้ภาษาไทย
    return dayjs(date).format('MMM YYYY')
}

export function formatYear(date: Date) {
    dayjs.locale('th') // ตั้งค่าให้ใช้ภาษาไทย
    return dayjs(date).format('YYYY')
}
