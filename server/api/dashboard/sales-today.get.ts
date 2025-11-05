import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import dayOfYear from 'dayjs/plugin/dayOfYear.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(advancedFormat)
dayjs.extend(dayOfYear)
dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Bangkok')

export default defineEventHandler(async () => {
    const now = dayjs()
    
    const startToday = now.startOf('day').toDate() as Date
    const endToday = now.endOf('day').toDate()

    const salesToday = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startToday, lte: endToday } },
      })
    return salesToday
})