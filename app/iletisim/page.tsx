import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'İletişim | Zen Sticker',
  description: 'Zen Sticker iletişim bilgileri',
}

export default async function ContactPage() {
  const page = await prisma.staticPage.findUnique({
    where: { slug: 'iletisim' },
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

