import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get product variants
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ variants })
  } catch (error: any) {
    console.error('Get variants error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get variants' },
      { status: 500 }
    )
  }
}

// POST - Create/Update product variants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { variants } = await request.json()

    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: 'Variants must be an array' }, { status: 400 })
    }

    // Delete existing variants
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    })

    // Create new variants
    if (variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: id,
          name: v.name,
          value: v.value,
          price: v.price || null,
          stock: v.stock || 0,
          sku: v.sku || null,
        })),
      })
    }

    const updatedVariants = await prisma.productVariant.findMany({
      where: { productId: id },
    })

    return NextResponse.json({ success: true, variants: updatedVariants })
  } catch (error: any) {
    console.error('Update variants error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update variants' },
      { status: 500 }
    )
  }
}

