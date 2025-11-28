import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AVAILABLE_FONTS } from '@/lib/fonts'

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

    // Delete existing images
    await prisma.productImage.deleteMany({
      where: { productId: id },
    })

    const product = await prisma.product.update({
      where: { id },
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

    // Handle custom options
    if (data.isCustomizable) {
      await prisma.customStickerOption.upsert({
        where: { productId: product.id },
        update: {
          availableFonts: AVAILABLE_FONTS, // Update existing fonts too
        },
        create: {
          productId: product.id,
          label: 'İsim Stickerı',
          availableFonts: AVAILABLE_FONTS,
          maxCharacters: 50,
        },
      })
    } else {
      await prisma.customStickerOption.deleteMany({
        where: { productId: product.id },
      })
    }

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
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

    // Önce ürünün siparişlerde kullanılıp kullanılmadığını kontrol et
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderItemsCount > 0) {
      // Eğer siparişlerde kullanılmışsa, ürünü silme, sadece pasif yap
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Ürün siparişlerde kullanıldığı için silinmedi, pasif yapıldı.',
        deactivated: true 
      })
    }

    // Siparişlerde kullanılmamışsa, tüm ilişkili kayıtları temizle
    // CustomStickerOption, ProductVariant, ProductImage, Favorite, CampaignPackageProduct
    // zaten cascade delete ile otomatik silinecek, ama manuel de silebiliriz
    
    // Önce ilişkili kayıtları manuel sil (güvenlik için)
    await prisma.customStickerOption.deleteMany({
      where: { productId: id },
    })
    
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    })
    
    await prisma.productImage.deleteMany({
      where: { productId: id },
    })
    
    await prisma.favorite.deleteMany({
      where: { productId: id },
    })
    
    await prisma.campaignPackageProduct.deleteMany({
      where: { productId: id },
    })

    // Sonra ürünü sil
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete product error:', error)
    
    // Foreign key constraint hatası
    if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
      return NextResponse.json(
        { 
          error: 'Bu ürün siparişlerde kullanıldığı için silinemez. Ürün pasif yapıldı.',
          deactivated: true 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  }
}

