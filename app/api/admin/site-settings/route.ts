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

    // Boş string'leri null'a çevir
    const cleanedData = {
      ...data,
      headerLogoPath: data.headerLogoPath || null,
      footerLogoPath: data.footerLogoPath || null,
      headerMarqueeText: data.headerMarqueeText || null,
      videoBackgroundUrl: data.videoBackgroundUrl || null,
      socialProofEnabled: data.socialProofEnabled ?? true,
      mockupEditorEnabled: data.mockupEditorEnabled ?? true,
    }

    await prisma.siteSettings.upsert({
      where: { id: '1' },
      update: cleanedData,
      create: {
        id: '1',
        ...cleanedData,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update site settings error:', error)
    const errorMessage = error.message || 'Failed to update settings'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

