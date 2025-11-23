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

    const page = await prisma.staticPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, page })
  } catch (error: any) {
    console.error('Create static page error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create page' },
      { status: 500 }
    )
  }
}

