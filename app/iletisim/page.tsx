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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">{page.title}</h1>
      <div
        className="prose max-w-none prose-headings:text-foreground dark:prose-headings:text-white prose-headings:font-bold prose-p:text-muted-foreground dark:prose-p:text-gray-300 prose-strong:text-foreground dark:prose-strong:text-white prose-ul:text-muted-foreground dark:prose-ul:text-gray-300 prose-ol:text-muted-foreground dark:prose-ol:text-gray-300 prose-li:text-muted-foreground dark:prose-li:text-gray-300 prose-a:text-primary hover:prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}

