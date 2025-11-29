import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { cartTotal } = await request.json()

    if (!cartTotal || cartTotal <= 0) {
      return NextResponse.json({ campaign: null })
    }

    const now = new Date()

    // Find active GENERAL campaigns with minimum purchase amount
    // Only campaigns without codes are auto-applied
    const campaigns = await prisma.campaign.findMany({
      where: {
        isActive: true,
        type: 'GENERAL',
        campaignCode: null, // Only campaigns without codes are auto-applied
        startDate: { lte: now },
        endDate: { gte: now },
        minPurchaseAmount: {
          lte: cartTotal, // Cart total must be >= minimum purchase
        },
      },
      orderBy: [
        { minPurchaseAmount: 'desc' }, // Prefer higher minimum amounts first
        { discountPercent: 'desc' }, // Then prefer higher discount percentages
      ],
    })

    if (campaigns.length === 0) {
      return NextResponse.json({ campaign: null })
    }

    // Select the best campaign (highest minimum amount that applies)
    const bestCampaign = campaigns[0]

    // Calculate discount
    let discountAmount = 0
    if (bestCampaign.discountPercent) {
      discountAmount = (cartTotal * bestCampaign.discountPercent) / 100
    } else if (bestCampaign.discountAmount) {
      discountAmount = bestCampaign.discountAmount
    }

    return NextResponse.json({
      campaign: {
        id: bestCampaign.id,
        title: bestCampaign.title,
        discountPercent: bestCampaign.discountPercent,
        discountAmount: bestCampaign.discountAmount,
        minPurchaseAmount: bestCampaign.minPurchaseAmount,
        calculatedDiscount: discountAmount,
      },
    })
  } catch (error: any) {
    console.error('Error checking campaigns:', error)
    return NextResponse.json({ campaign: null }, { status: 500 })
  }
}

