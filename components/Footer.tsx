import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export async function Footer() {
  const settings = await prisma.siteSettings.findFirst()
  const staticPages = await prisma.staticPage.findMany({
    where: { isActive: true },
    orderBy: { slug: 'asc' },
  })

  // Kategorize et
  const corporatePages = staticPages.filter(p => 
    ['hakkimizda', 'iletisim', 'sss'].includes(p.slug)
  )
  const legalPages = staticPages.filter(p =>
    ['kvkk-ve-gizlilik', 'mesafeli-satis-sozlesmesi', 'iade-ve-degisim'].includes(p.slug)
  )
  const supportPages = staticPages.filter(p =>
    ['kargo-ve-teslimat', 'cayma-hakki'].includes(p.slug)
  )
  const otherPages = staticPages.filter(p =>
    !corporatePages.includes(p) && !legalPages.includes(p) && !supportPages.includes(p)
  )

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Image
              src={settings?.footerLogoPath || "/logo/beyaz_zensticker.png"}
              alt="Zen Sticker"
              width={120}
              height={40}
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm">
              Premium araç sticker ve kaplama çözümleri
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Kurumsal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {corporatePages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="hover:text-white transition">
                    {page.title}
                  </Link>
                </li>
              ))}
              {corporatePages.length === 0 && (
                <>
                  <li>
                    <Link href="/hakkimizda" className="hover:text-white transition">
                      Hakkımızda
                    </Link>
                  </li>
                  <li>
                    <Link href="/iletisim" className="hover:text-white transition">
                      İletişim
                    </Link>
                  </li>
                  <li>
                    <Link href="/sss" className="hover:text-white transition">
                      SSS
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Yasal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {legalPages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="hover:text-white transition">
                    {page.title}
                  </Link>
                </li>
              ))}
              {legalPages.length === 0 && (
                <>
                  <li>
                    <Link href="/kvkk-ve-gizlilik" className="hover:text-white transition">
                      KVKK ve Gizlilik
                    </Link>
                  </li>
                  <li>
                    <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white transition">
                      Mesafeli Satış
                    </Link>
                  </li>
                  <li>
                    <Link href="/iade-ve-degisim" className="hover:text-white transition">
                      İade ve Değişim
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Destek</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {supportPages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="hover:text-white transition">
                    {page.title}
                  </Link>
                </li>
              ))}
              {otherPages.length > 0 && (
                <>
                  {otherPages.map((page) => (
                    <li key={page.id}>
                      <Link href={`/${page.slug}`} className="hover:text-white transition">
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              {supportPages.length === 0 && otherPages.length === 0 && (
                <>
                  <li>
                    <Link href="/kargo-ve-teslimat" className="hover:text-white transition">
                      Kargo ve Teslimat
                    </Link>
                  </li>
                  <li>
                    <Link href="/cayma-hakki" className="hover:text-white transition">
                      Cayma Hakkı
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Zen Sticker. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
