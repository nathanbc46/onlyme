import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Bangkok')

export default defineEventHandler(async () => {
const now = dayjs()
const start7DaysAgo = now.subtract(6, 'day').startOf('day').toDate()
const end7Days = now.endOf('day').toDate()

const last7DaysSales = await prisma.$queryRawUnsafe(`
  SELECT 
    TO_CHAR(DATE("createdAt"), 'YYYY-MM-DD') AS "date",
    SUM("totalAmount") AS "totalSales",
    SUM("totalCost") AS "totalCost",
    SUM("totalAmount" - COALESCE("totalCost", 0)) AS "profit"
  FROM "order"
  WHERE "status" = 'CLOSED'
    AND "createdAt" BETWEEN '${start7DaysAgo.toISOString()}' AND '${end7Days.toISOString()}'
  GROUP BY DATE("createdAt")
  ORDER BY DATE("createdAt")
`)

console.log('last7DaysSales', last7DaysSales)

return last7DaysSales
})