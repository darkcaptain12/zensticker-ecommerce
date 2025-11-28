import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if address belongs to user
    const address = await prisma.address.findUnique({
      where: { id },
    })

    if (!address || address.userId !== user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    })

    // Set this as default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Set default address error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set default address' },
      { status: 500 }
    )
  }
}

