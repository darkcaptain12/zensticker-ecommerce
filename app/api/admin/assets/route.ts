import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets', assets: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Check if asset already exists
    const existing = await prisma.asset.findUnique({
      where: { url: data.url },
    })

    if (existing) {
      return NextResponse.json({ success: true, asset: existing })
    }

    const asset = await prisma.asset.create({
      data: {
        url: data.url,
        altText: data.altText || null,
        type: data.type || 'IMAGE',
        category: data.category || null,
      },
    })

    return NextResponse.json({ success: true, asset })
  } catch (error: any) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create asset' },
      { status: 500 }
    )
  }
}

