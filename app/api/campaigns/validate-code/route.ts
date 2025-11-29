import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal, cartItems } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Kampanya kodu gerekli' })
    }

    const now = new Date()

    // Find active campaign with matching code
    const campaign = await prisma.campaign.findFirst({
      where: {
        campaignCode: code.toUpperCase().trim(),
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        minPurchaseAmount: cartTotal ? { lte: cartTotal } : undefined,
      },
      include: {
        categories: true,
        directProducts: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Geçersiz kampanya kodu veya kampanya süresi dolmuş' 
      })
    }

    // Double check dates (in case of timezone issues)
    const startDate = new Date(campaign.startDate)
    const endDate = new Date(campaign.endDate)
    if (now < startDate || now > endDate) {
      return NextResponse.json({
        valid: false,
        error: `Bu kampanya kodu ${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')} tarihleri arasında geçerlidir.`,
      })
    }

    // Check minimum purchase amount
    if (campaign.minPurchaseAmount && cartTotal < campaign.minPurchaseAmount) {
      return NextResponse.json({
        valid: false,
        error: `Bu kampanya kodu için minimum ${campaign.minPurchaseAmount}₺ alışveriş tutarı gereklidir.`,
      })
    }

    // Check if campaign applies to cart items and calculate applicable total
    let applicableTotal = cartTotal
    let applicableItems: any[] = []

    if (campaign.type === 'CATEGORY' && campaign.categories.length > 0) {
      // Get product IDs from cart
      const cartProductIds = cartItems?.map((item: any) => item.productId) || []
      
      // Get products from cart to check their categories
      const cartProducts = await prisma.product.findMany({
        where: {
          id: { in: cartProductIds },
        },
        select: {
          id: true,
          categoryId: true,
          price: true,
        },
      })

      const campaignCategoryIds = campaign.categories.map(c => c.id)
      
      // Filter cart items that belong to campaign categories
      applicableItems = (cartItems || []).filter((item: any) => {
        const product = cartProducts.find(p => p.id === item.productId)
        return product && product.categoryId && campaignCategoryIds.includes(product.categoryId)
      })

      if (applicableItems.length === 0) {
        return NextResponse.json({
          valid: false,
          error: `Bu kampanya kodu sadece şu kategoriler için geçerlidir: ${campaign.categories.map(c => c.name).join(', ')}`,
        })
      }

      // Calculate total for applicable items only
      applicableTotal = applicableItems.reduce((sum: number, item: any) => {
        return sum + (item.salePrice || item.price || 0) * (item.quantity || 1)
      }, 0)

    } else if (campaign.type === 'PRODUCT' && campaign.directProducts.length > 0) {
      // Check if cart contains any of the campaign products
      const cartProductIds = cartItems?.map((item: any) => item.productId) || []
      const campaignProductIds = campaign.directProducts.map(p => p.id)
      
      // Filter cart items that are in campaign products
      applicableItems = (cartItems || []).filter((item: any) => 
        campaignProductIds.includes(item.productId)
      )

      if (applicableItems.length === 0) {
        return NextResponse.json({
          valid: false,
          error: `Bu kampanya kodu sadece kampanyaya dahil ürünler için geçerlidir.`,
        })
      }

      // Calculate total for applicable items only
      applicableTotal = applicableItems.reduce((sum: number, item: any) => {
        return sum + (item.salePrice || item.price || 0) * (item.quantity || 1)
      }, 0)

    } else {
      // GENERAL type campaigns apply to all products
      applicableItems = cartItems || []
      applicableTotal = cartTotal
    }

    // Calculate discount based on applicable total
    let discountAmount = 0
    if (campaign.discountPercent) {
      discountAmount = (applicableTotal * campaign.discountPercent) / 100
    } else if (campaign.discountAmount) {
      discountAmount = campaign.discountAmount
    }

    return NextResponse.json({
      valid: true,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        discountPercent: campaign.discountPercent,
        discountAmount: campaign.discountAmount,
        calculatedDiscount: discountAmount,
      },
    })
  } catch (error: any) {
    console.error('Error validating campaign code:', error)
    return NextResponse.json(
      { valid: false, error: 'Kampanya kodu kontrol edilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

