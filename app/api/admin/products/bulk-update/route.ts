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
    const { productIds, type, value, operation } = await request.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 })
    }

    if (!type || !['price', 'stock'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be "price" or "stock"' }, { status: 400 })
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 })
    }

    // Get current products
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 })
    }

    // Update products based on type and operation
    const updatePromises = products.map((product) => {
      let newValue: number

      if (type === 'price') {
        if (operation === 'set') {
          newValue = value
        } else if (operation === 'increase') {
          newValue = product.price + value
        } else if (operation === 'decrease') {
          newValue = Math.max(0, product.price - value)
        } else {
          newValue = product.price
        }

        return prisma.product.update({
          where: { id: product.id },
          data: { price: newValue },
        })
      } else if (type === 'stock') {
        if (operation === 'set') {
          newValue = value
        } else if (operation === 'add') {
          newValue = product.stock + value
        } else if (operation === 'subtract') {
          newValue = Math.max(0, product.stock - value)
        } else {
          newValue = product.stock
        }

        return prisma.product.update({
          where: { id: product.id },
          data: { stock: newValue },
        })
      }
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `${products.length} products updated`,
    })
  } catch (error: any) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update products' },
      { status: 500 }
    )
  }
}

