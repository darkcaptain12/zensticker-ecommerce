import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type || 'GENERAL',
        discountPercent: data.discountPercent || null,
        discountAmount: data.discountAmount || null,
        packagePrice: data.packagePrice || null,
        imageUrl: data.imageUrl || null,
        minPurchaseAmount: data.minPurchaseAmount || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        categories: data.categoryIds && data.categoryIds.length > 0 ? {
          connect: data.categoryIds.map((id: string) => ({ id })),
        } : undefined,
        products: data.productIds && data.productIds.length > 0 ? {
          connect: data.productIds.map((id: string) => ({ id })),
        } : undefined,
        packageProducts: data.packageProducts && data.packageProducts.length > 0 ? {
          create: data.packageProducts.map((pp: any) => ({
            productId: pp.productId,
            quantity: pp.quantity || 1,
          })),
        } : undefined,
      },
      include: {
        categories: true,
        products: true,
        packageProducts: true,
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

