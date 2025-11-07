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

  try {
    const now = dayjs()

    // ==== 1️⃣ ยอดขายวันนี้ vs เมื่อวาน ====
    const startToday = now.startOf('day').toDate() as Date
    const endToday = now.endOf('day').toDate()
    const startYesterday = now.subtract(1, 'day').startOf('day').toDate()
    const endYesterday = now.subtract(1, 'day').endOf('day').toDate()

    const [today, yesterday, todayCost] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startToday, lte: endToday } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startYesterday, lte: endYesterday } },
      }),
      prisma.order.aggregate({
        _sum: { totalCost: true },
        where: { createdAt: { gte: startToday, lte: endToday } },
      }),
    ])

    const todaySales = Number(today._sum.totalAmount || 0)
    const yesterdaySales = Number(yesterday._sum.totalAmount || 0)
    const todayGrowth = yesterdaySales === 0 ? null : ((todaySales - yesterdaySales) / yesterdaySales) * 100

    const todayCostVal = Number(todayCost._sum.totalCost || 0)

    // ==== 2️⃣ ยอดขายเดือนนี้ vs เดือนที่แล้วในช่วงวันเดียวกัน ====
    const startOfMonth = now.startOf('month')
    const dayOfMonth = now.date()
    const endOfCurrentPeriod = startOfMonth.add(dayOfMonth - 1, 'day').endOf('day')

    const startLastMonth = startOfMonth.subtract(1, 'month')
    const endLastMonthSamePeriod = startLastMonth.add(dayOfMonth - 1, 'day').endOf('day')

    const [thisMonth, lastMonth, thisMonthCost] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startOfMonth.toDate(), lte: endOfCurrentPeriod.toDate() } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: startLastMonth.toDate(), lte: endLastMonthSamePeriod.toDate() } },
      }),
      prisma.order.aggregate({
        _sum: { totalCost: true },
        where: { createdAt: { gte: startLastMonth.toDate(), lte: endOfCurrentPeriod.toDate() } },
      }),
    ])

    const thisMonthSales = Number(thisMonth._sum.totalAmount || 0)
    const lastMonthSales = Number(lastMonth._sum.totalAmount || 0)
    const monthGrowth = lastMonthSales === 0 ? null : ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
    const thisMonthCostVal = Number(thisMonthCost._sum.totalCost || 0)

    // ===== 6️⃣ ยอดขายเฉลี่ยต่อวันในเดือนนี้ =====
    const daysPassed = dayOfMonth
    const avgDailySales = daysPassed > 0 ? thisMonthSales / daysPassed : 0
    const avgDailyProfit = daysPassed > 0 ? (thisMonthSales-thisMonthCostVal) / daysPassed : 0


    // ===== 3️⃣ ยอดขายปีนี้ vs ปีที่แล้ว (ช่วงวันเดียวกัน) =====
    const startOfYear = now.startOf('year')
    const dayOfYearNum = now.dayOfYear()
    const endOfCurrentYearPeriod = startOfYear.add(dayOfYearNum - 1, 'day').endOf('day')

    const startLastYear = startOfYear.subtract(1, 'year')
    const endLastYearSamePeriod = startLastYear.add(dayOfYearNum - 1, 'day').endOf('day')

    const [thisYear, lastYear, thisYearCost] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'CLOSED',
          createdAt: { gte: startOfYear.toDate(), lte: endOfCurrentYearPeriod.toDate() },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: 'CLOSED',
          createdAt: { gte: startLastYear.toDate(), lte: endLastYearSamePeriod.toDate() },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalCost: true },
        where: {
          status: 'CLOSED',
          createdAt: { gte: startOfYear.toDate(), lte: endOfCurrentYearPeriod.toDate() },
        },
      }),
    ])

    const thisYearSales = Number(thisYear._sum.totalAmount || 0)
    const lastYearSales = Number(lastYear._sum.totalAmount || 0)
    const yearGrowth = lastYearSales === 0 ? null : ((thisYearSales - lastYearSales) / lastYearSales) * 100
    const thisYearCostVal = Number(thisYearCost._sum.totalCost || 0)

    // ===== 4️⃣ ยอดขายย้อนหลัง 7 วัน (ทำกราฟ) =====
    const start7DaysAgo = now.subtract(6, 'day').startOf('day').toDate()
    const end7Days = now.endOf('day').toDate()

    const last7DaysOrders = await prisma.order.findMany({
      where: {
        status: 'CLOSED',
        createdAt: { gte: start7DaysAgo, lte: end7Days },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    })

    // รวมยอดต่อวัน
    const dailySalesMap = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
      const date = now.subtract(6 - i, 'day').format('YYYY-MM-DD')
      dailySalesMap.set(date, 0)
    }

    for (const order of last7DaysOrders) {
      const date = dayjs(order.createdAt).tz().format('YYYY-MM-DD')
      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + Number(order.totalAmount))
    }

    const last7DaysSales = Array.from(dailySalesMap.entries()).map(([date, total]) => ({
      date,
      total,
    }))

    // ===== 5️⃣ Top 5 สินค้าขายดี =====
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true, total: true, totalItemCost: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const topProductDetails = await Promise.all(
      topProducts.map(async (p) => {
        const product = await prisma.product.findUnique({
          where: { id: p.productId },
          select: { id: true, name: true},
        })
        return {
          id: product?.id,
          name: product?.name,
          totalSold: p._sum.quantity || 0,
          totalRevenue: p._sum.total || 0,
          totalCost: p._sum.totalItemCost || 0,
          profit: Number(p._sum.total) - Number(p._sum.totalItemCost)
        }
      })
    )


    // ✅ ส่งกลับข้อมูลทั้งหมด
    return {
      today: {
        dateStart: startToday,
        dateEnd: endToday,
        total: todaySales,
        compareToYesterday: yesterdaySales,
        growthPercent: todayGrowth,
        todayCost: todayCostVal
      },
      month: {
        dateStart: startOfMonth.toDate(),
        total: thisMonthSales,
        compareToLastMonth: lastMonthSales,
        growthPercent: monthGrowth,
        averageDailySales: avgDailySales,
        monthCost: thisMonthCostVal,
        averageDailyProfit: avgDailyProfit
      },
      year: {
        dateStart: startOfYear.toDate(),
        total: thisYearSales,
        compareToLastYear: lastYearSales,
        growthPercent: yearGrowth,
        yearCost: thisYearCostVal
      },
      chart: {
        last7Days: last7DaysSales,
      },
      topProducts: topProductDetails
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message
    })
  }


})