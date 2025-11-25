import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, Users, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RevenueFilter } from '@/components/admin/RevenueFilter'
import { CleanupOrdersButton } from '@/components/admin/CleanupOrdersButton'

export default async function AdminDashboard() {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const [
    productCount,
    activeProductCount,
    orderCount,
    pendingOrderCount,
    userCount,
    totalRevenue,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } } }),
    prisma.order.count({ where: { status: 'PREPARING' } }),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfToday },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfWeek },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfYear },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 }, isActive: true },
      take: 5,
      orderBy: { stock: 'asc' },
      include: { category: true },
    }),
  ])

  const stats = [
    {
      title: 'Toplam Ürün',
      value: productCount,
      subtitle: `${activeProductCount} aktif`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/urunler',
    },
    {
      title: 'Toplam Sipariş',
      value: orderCount,
      subtitle: `${pendingOrderCount} hazırlanıyor`,
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/siparisler',
    },
    {
      title: 'Toplam Kullanıcı',
      value: userCount,
      subtitle: 'Kayıtlı kullanıcı',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin/kullanicilar',
    },
  ]

  // Get monthly breakdown for revenue filter
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

  const revenueData = {
    total: totalRevenue._sum.totalAmount || 0,
    daily: dailyRevenue._sum.totalAmount || 0,
    weekly: weeklyRevenue._sum.totalAmount || 0,
    monthly: monthlyRevenue._sum.totalAmount || 0,
    yearly: yearlyRevenue._sum.totalAmount || 0,
    today: dailyRevenue._sum.totalAmount || 0,
    thisMonth: monthlyRevenue._sum.totalAmount || 0,
    thisYear: yearlyRevenue._sum.totalAmount || 0,
    monthlyBreakdown,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Hoş geldiniz! İşte genel bakışınız.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href || '#'}>
              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} dark:bg-opacity-20 p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${stat.color} dark:opacity-80`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        <RevenueFilter initialData={revenueData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Son Siparişler
              </CardTitle>
              <div className="flex gap-2">
                <CleanupOrdersButton />
                <Link href="/admin/siparisler">
                  <Button variant="outline" size="sm">
                    Tümünü Gör
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.user?.name || order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Henüz sipariş yok</p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Düşük Stok
              </CardTitle>
              <Link href="/admin/urunler">
                <Button variant="outline" size="sm">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <Link key={product.id} href={`/admin/urunler/${product.id}`}>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category.name}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.stock} adet
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Tüm ürünler stokta</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

