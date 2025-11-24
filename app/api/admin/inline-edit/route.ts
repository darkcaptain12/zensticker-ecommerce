import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { entityType, entityId, field, value } = await request.json()

    if (!entityType || !entityId || !field) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (entityType) {
      case 'banner':
        result = await prisma.banner.update({
          where: { id: entityId },
          data: { [field]: value },
        })
        break

      case 'hero':
        // Hero section için site settings kullanılabilir veya ayrı bir model
        result = await prisma.siteSettings.upsert({
          where: { id: '1' },
          update: { [field]: value },
          create: {
            id: '1',
            [field]: value,
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            whatsappPhoneNumber: '+905551234567',
          },
        })
        break

      case 'site-settings':
        result = await prisma.siteSettings.upsert({
          where: { id: '1' },
          update: { [field]: value },
          create: {
            id: '1',
            [field]: value,
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            whatsappPhoneNumber: '+905551234567',
          },
        })
        break

      case 'static-page':
        result = await prisma.staticPage.update({
          where: { id: entityId },
          data: { [field]: value },
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid entity type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Inline edit error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update' },
      { status: 500 }
    )
  }
}

