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

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku || null,
        description: data.description || null,
        price: parseFloat(data.price),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        stock: parseInt(data.stock),
        categoryId: data.categoryId,
        campaignId: data.campaignId || null,
        isActive: data.isActive ?? true,
        isCustomizable: data.isCustomizable ?? false,
        images: {
          create: (data.images || []).map((img: any) => ({
            url: img.url,
            altText: img.altText || null,
            isMain: img.isMain || false,
            isVideo: img.isVideo || false,
          })),
        },
      },
    })

    // If customizable, create custom options
    if (data.isCustomizable) {
      await prisma.customStickerOption.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          label: 'İsim Stickerı',
          availableFonts: [
            'Arial',
            'Helvetica',
            'Times New Roman',
            'Courier New',
            'Verdana',
            'Georgia',
            'Comic Sans MS',
            'Impact',
          ],
          maxCharacters: 50,
        },
      })
    }

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}

