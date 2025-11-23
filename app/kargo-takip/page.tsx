import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderTrackingClient } from '@/components/OrderTrackingClient'
import { redirect } from 'next/navigation'

export default async function OrderTrackingPage() {
  const session = await getServerSession(authOptions)

  // Eğer kullanıcı giriş yapmışsa, siparişlerini getir
  let userOrders = null
  if (session?.user?.id) {
    userOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  return <OrderTrackingClient userOrders={userOrders} />
}
