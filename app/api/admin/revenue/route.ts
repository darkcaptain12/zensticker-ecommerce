import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const now = new Date()
    let dateFilter: any = {}

    // Calculate date ranges
    switch (period) {
      case 'today':
        const startOfToday = new Date(now)
        startOfToday.setHours(0, 0, 0, 0)
        dateFilter = {
          createdAt: {
            gte: startOfToday,
          },
        }
        break
      case 'week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - 7)
        startOfWeek.setHours(0, 0, 0, 0)
        dateFilter = {
          createdAt: {
            gte: startOfWeek,
          },
        }
        break
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = {
          createdAt: {
            gte: startOfMonth,
          },
        }
        break
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        dateFilter = {
          createdAt: {
            gte: startOfYear,
          },
        }
        break
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        }
        break
    }

    const orderFilter = {
      status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] as const },
      ...dateFilter,
    }

    // Get total revenue
    const totalRevenue = await prisma.order.aggregate({
      where: orderFilter,
      _sum: { totalAmount: true },
      _count: true,
    })

    // Get daily revenue (today)
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const dailyRevenue = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfToday },
      },
      _sum: { totalAmount: true },
    })

    // Get weekly revenue
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    startOfWeek.setHours(0, 0, 0, 0)
    const weeklyRevenue = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfWeek },
      },
      _sum: { totalAmount: true },
    })

    // Get monthly revenue
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyRevenue = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    })

    // Get yearly revenue
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const yearlyRevenue = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfYear },
      },
      _sum: { totalAmount: true },
    })

    // Get monthly breakdown for last 12 months
    const monthlyBreakdown = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      
      const monthRevenue = await prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { totalAmount: true },
        _count: true,
      })

      monthlyBreakdown.push({
        month: monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        revenue: monthRevenue._sum.totalAmount || 0,
        count: monthRevenue._count || 0,
      })
    }

    return NextResponse.json({
      total: totalRevenue._sum.totalAmount || 0,
      daily: dailyRevenue._sum.totalAmount || 0,
      weekly: weeklyRevenue._sum.totalAmount || 0,
      monthly: monthlyRevenue._sum.totalAmount || 0,
      yearly: yearlyRevenue._sum.totalAmount || 0,
      today: dailyRevenue._sum.totalAmount || 0,
      thisMonth: monthlyRevenue._sum.totalAmount || 0,
      thisYear: yearlyRevenue._sum.totalAmount || 0,
      monthlyBreakdown,
    })
  } catch (error: any) {
    console.error('Revenue API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}

