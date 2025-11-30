import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'

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
  'arama',
  'kampanyalar',
  'kampanya',
  'kvkk', // KVKK sayfası özel bir sayfa olduğu için reserved
]

// Disable caching - always fetch fresh data from database
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Check if it's a reserved route
  if (reservedRoutes.includes(slug)) {
    return { title: 'Sayfa Bulunamadı | Zen Sticker' }
  }

  const page = await prisma.staticPage.findUnique({
    where: { slug },
  })

  if (!page || !page.isActive) {
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

  // Always fetch fresh data from database (no caching)
  const page = await prisma.staticPage.findUnique({
    where: { slug },
  })

  if (!page || !page.isActive) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
        <div className={`${page.imageUrl ? 'flex flex-col lg:flex-row gap-8 items-start' : ''} max-w-6xl mx-auto`}>
          {/* İçerik Kısmı */}
          <div className={page.imageUrl ? 'flex-1 lg:w-2/3' : 'w-full'}>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 border-b-2 border-primary pb-4">
              {page.title}
            </h1>
            <div
              className="prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-gray-900 prose-strong:font-bold prose-em:text-gray-700 prose-em:italic prose-ul:list-disc prose-ul:mb-4 prose-ol:list-decimal prose-ol:mb-4 prose-li:text-gray-700 prose-li:mb-2 prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:pr-4 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:text-gray-700 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-50 prose-th:font-bold prose-td:border prose-td:border-gray-300 prose-td:p-2 max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>

          {/* Görsel Kısmı */}
          {page.imageUrl && (
            <div className="lg:w-1/3 flex-shrink-0 w-full lg:sticky lg:top-24 lg:self-start">
              <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px] rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
                <Image
                  src={page.imageUrl}
                  alt={page.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

