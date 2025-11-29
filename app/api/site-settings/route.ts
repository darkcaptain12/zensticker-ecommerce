import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json({
        whatsappPhoneNumber: '+905551234567',
      })
    }

    return NextResponse.json({
      whatsappPhoneNumber: settings.whatsappPhoneNumber,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      headerMarqueeText: settings.headerMarqueeText,
      videoBackgroundUrl: settings.videoBackgroundUrl,
      headerLogoPath: settings.headerLogoPath,
      footerLogoPath: settings.footerLogoPath,
      socialProofEnabled: settings.socialProofEnabled,
      mockupEditorEnabled: settings.mockupEditorEnabled,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingCost: settings.shippingCost,
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

