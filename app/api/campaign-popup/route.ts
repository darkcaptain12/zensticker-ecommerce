import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const popup = await prisma.campaignPopup.findFirst({
      where: { isActive: true },
    })

    if (!popup) {
      return NextResponse.json(null, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
    }

    return NextResponse.json(popup, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error fetching campaign popup:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign popup' },
      { status: 500 }
    )
  }
}

