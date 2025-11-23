import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Reserved routes that should not be handled by this dynamic route
const reservedRoutes = [
  'admin',
  'api',
  'giris',
  'kayit',
  'profil',
  'sepet',
  'odeme',
  'kargo-takip',
  'kategoriler',
  'kategori',
  'urun',
  'siparis-tesekkur',
]

export async function generateStaticParams() {
  const pages = await prisma.staticPage.findMany({
    where: { isActive: true },
  })

  return pages
    .filter((page) => !reservedRoutes.includes(page.slug))
    .map((page) => ({
      slug: page.slug,
    }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.staticPage.findUnique({
    where: { slug },
  })

  if (!page) {
    return { title: 'Sayfa Bulunamadı | Zen Sticker' }
  }

  return {
    title: `${page.title} | Zen Sticker`,
    description: page.content.substring(0, 160),
  }
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Check if it's a reserved route
  if (reservedRoutes.includes(slug)) {
    notFound()
  }

  const page = await prisma.staticPage.findUnique({
    where: { slug },
  })

  if (!page || !page.isActive) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}

