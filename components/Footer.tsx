import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FooterLogo } from './FooterLogo'
import { Instagram, MessageCircle } from 'lucide-react'

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
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-dark-card dark:via-dark-soft dark:to-dark border-t border-border dark:border-primary/20 text-foreground dark:text-white mt-auto overflow-hidden">
      {/* Background Pattern with Neon Accent */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300e0ff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <FooterLogo logoPath={settings?.footerLogoPath || null} />
            <p className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed">
              Premium araç sticker ve kaplama çözümleri ile aracınızı öne çıkarın. 
              Kalite ve güvenilirlik odaklı hizmet anlayışımız.
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="https://www.instagram.com/zenstickerr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 hover:shadow-neon-sm border border-primary/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-primary" />
              </a>
              <a
                href={`https://wa.me/905315661805`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 hover:shadow-neon-sm border border-primary/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-primary" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-primary">Kurumsal</h3>
            <ul className="space-y-3 text-sm">
              {corporatePages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="text-gray-300 dark:text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block dark:hover:shadow-neon-sm">
                    {page.title}
                  </Link>
                </li>
              ))}
              {corporatePages.length === 0 && (
                <>
                  <li>
                    <Link href="/hakkimizda" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      Hakkımızda
                    </Link>
                  </li>
                  <li>
                    <Link href="/iletisim" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      İletişim
                    </Link>
                  </li>
                  <li>
                    <Link href="/sss" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      SSS
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-primary">Yasal</h3>
            <ul className="space-y-3 text-sm">
              {legalPages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block hover:shadow-neon-sm">
                    {page.title}
                  </Link>
                </li>
              ))}
              {legalPages.length === 0 && (
                <>
                  <li>
                    <Link href="/kvkk-ve-gizlilik" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      KVKK ve Gizlilik
                    </Link>
                  </li>
                  <li>
                    <Link href="/mesafeli-satis-sozlesmesi" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      Mesafeli Satış
                    </Link>
                  </li>
                  <li>
                    <Link href="/iade-ve-degisim" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      İade ve Değişim
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-primary">Destek</h3>
            <ul className="space-y-3 text-sm">
              {supportPages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block hover:shadow-neon-sm">
                    {page.title}
                  </Link>
                </li>
              ))}
              {otherPages.length > 0 && (
                <>
                  {otherPages.map((page) => (
                    <li key={page.id}>
                      <Link href={`/${page.slug}`} className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              {supportPages.length === 0 && otherPages.length === 0 && (
                <>
                  <li>
                    <Link href="/kargo-ve-teslimat" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      Kargo ve Teslimat
                    </Link>
                  </li>
                  <li>
                    <Link href="/cayma-hakki" className="text-gray-300 hover:text-primary transition-all hover:translate-x-1 inline-block">
                      Cayma Hakkı
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Zen Sticker. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/kvkk-ve-gizlilik" className="hover:text-primary transition-all hover:shadow-neon-sm">
                Gizlilik Politikası
              </Link>
              <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-primary transition-all hover:shadow-neon-sm">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
