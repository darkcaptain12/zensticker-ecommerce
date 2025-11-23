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

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        type: data.type,
        filePath: data.filePath,
        linkUrl: data.linkUrl || null,
        isActive: data.isActive ?? true,
        position: data.position || 0,
      },
    })

    return NextResponse.json({ success: true, banner })
  } catch (error: any) {
    console.error('Create banner error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create banner' },
      { status: 500 }
    )
  }
}

