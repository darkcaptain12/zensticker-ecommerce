import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const popup = await prisma.campaignPopup.findFirst({
      where: { isActive: true },
    })

    if (!popup) {
      return NextResponse.json(null)
    }

    return NextResponse.json(popup)
  } catch (error) {
    console.error('Error fetching campaign popup:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign popup' },
      { status: 500 }
    )
  }
}

