import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import 'dayjs/locale/th.js'  // โหลด locale ไทย

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export function formatDate(date: Date) {
    dayjs.locale('th') // ตั้งค่าให้ใช้ภาษาไทย
    return dayjs(date).format('DD MMM YYYY')
}

export function formatDateTime(date: Date, todayText = 'Today') {
    dayjs.locale('th') // ตั้งค่าให้ใช้ภาษาไทย

    if (todayText === 'Today' && dayjs(date).isSame(dayjs(), 'day')) {
        return todayText+' '+dayjs(date).format('HH:mm')
    }

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
