'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { HeaderMarquee } from './HeaderMarquee'

export function Header() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <HeaderMarquee />
      <header className="sticky top-0 z-50 w-full border-b bg-black text-white">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo/siyah_zensticker.png"
              alt="Zen Sticker"
              width={120}
              height={40}
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-300 transition">
              Ana Sayfa
            </Link>
            <Link href="/kategoriler" className="hover:text-gray-300 transition">
              Kategoriler
            </Link>
            <Link href="/kampanyalar" className="hover:text-gray-300 transition">
              Kampanyalar
            </Link>
            <Link href="/kargo-takip" className="hover:text-gray-300 transition">
              Kargo Takip
            </Link>
            <Link href="/iletisim" className="hover:text-gray-300 transition">
              İletişim
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/profil">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-white hover:bg-gray-800">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-white hover:bg-gray-800"
                >
                  Çıkış
                </Button>
              </>
            ) : (
              <Link href="/giris">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Giriş
                </Button>
              </Link>
            )}

            <Link href="/sepet" className="relative">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-2 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/kategoriler"
                className="px-4 py-2 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kategoriler
              </Link>
              <Link
                href="/kampanyalar"
                className="px-4 py-2 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kampanyalar
              </Link>
              <Link
                href="/kargo-takip"
                className="px-4 py-2 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kargo Takip
              </Link>
              <Link
                href="/iletisim"
                className="px-4 py-2 hover:bg-gray-800 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  )
}

