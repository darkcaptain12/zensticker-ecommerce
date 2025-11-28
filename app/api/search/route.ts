import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ products: [] })
    }

    const searchTerm = q.trim().toLowerCase()

    // Search in product name, description, and category name
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      },
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: true,
        campaign: true,
      },
      take: limit,
      orderBy: [
        // Prioritize exact matches in name
        { name: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu', products: [] },
      { status: 500 }
    )
  }
}

