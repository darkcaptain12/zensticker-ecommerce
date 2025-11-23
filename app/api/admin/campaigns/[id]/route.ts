import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // First, disconnect all existing relations
    await prisma.campaign.update({
      where: { id },
      data: {
        categories: { set: [] },
        products: { set: [] },
        packageProducts: { deleteMany: {} },
      },
    })

    const campaign = await prisma.campaign.update({
      where: { id },
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
    console.error('Update campaign error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}

