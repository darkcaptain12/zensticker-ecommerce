import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Mevcut pop-up'ı bul veya yeni oluştur
    const existingPopup = await prisma.campaignPopup.findFirst()

    if (existingPopup) {
      // Güncelle
      const popup = await prisma.campaignPopup.update({
        where: { id: existingPopup.id },
        data: {
          title: data.title || null,
          imageUrl: data.imageUrl || null,
          text: data.text || null,
          buttonText: data.buttonText || null,
          buttonUrl: data.buttonUrl || null,
          isActive: data.isActive ?? true,
          showDelay: data.showDelay || 3000,
        },
      })

      return NextResponse.json(popup)
    } else {
      // Yeni oluştur
      const popup = await prisma.campaignPopup.create({
        data: {
          title: data.title || null,
          imageUrl: data.imageUrl || null,
          text: data.text || null,
          buttonText: data.buttonText || null,
          buttonUrl: data.buttonUrl || null,
          isActive: data.isActive ?? true,
          showDelay: data.showDelay || 3000,
        },
      })

      return NextResponse.json(popup)
    }
  } catch (error) {
    console.error('Error saving campaign popup:', error)
    return NextResponse.json(
      { error: 'Failed to save campaign popup' },
      { status: 500 }
    )
  }
}

