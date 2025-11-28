import { prisma } from '@/lib/prisma'
import { MockupEditor } from '@/components/MockupEditor'

export default async function MockupEditorPage() {
  // Check if mockup editor is enabled
  const settings = await prisma.siteSettings.findFirst()
  
  if (!settings?.mockupEditorEnabled) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Mockup Editörü</h1>
        <p className="text-gray-600">
          Mockup editörü şu anda aktif değil. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    )
  }

  // Get active products for selection
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isMain: true }, take: 1 },
      category: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sticker Editörü</h1>
      <p className="text-gray-600 mb-8">
        Araç fotoğrafınızı yükleyin ve sticker'ları yerleştirin.
      </p>
      <MockupEditor products={products} />
    </div>
  )
}

