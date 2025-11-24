'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { useTheme } from 'next-themes'
import { HeaderMarquee } from './HeaderMarquee'
import { SearchBar } from './SearchBar'
import { CategoryDropdown } from './CategoryDropdown'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const { theme, systemTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const currentTheme = theme === 'system' ? systemTheme : theme
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Logo path based on theme
  const logoPath = mounted && currentTheme === 'dark' 
    ? '/logo/beyaz_zensticker.png' 
    : '/logo/siyah_zensticker.png'

  return (
    <>
      <HeaderMarquee />
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md text-foreground shadow-sm dark:border-primary/20 dark:bg-dark-soft/80 dark:text-white dark:shadow-neon-sm">
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group">
            <div className="relative h-8 md:h-10 w-auto">
              {mounted && (
                <Image
                  src={logoPath}
                  alt="Zen Sticker"
                  width={120}
                  height={40}
                  className="h-8 md:h-10 w-auto object-contain"
                  priority
                />
              )}
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            <Link href="/" className="px-4 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white">
              Ana Sayfa
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
            <CategoryDropdown />
            <Link href="/kampanyalar" className="px-4 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white">
              Kampanyalar
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
            <Link href="/kargo-takip" className="px-4 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white">
              Kargo Takip
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
            <Link href="/iletisim" className="px-4 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white">
              İletişim
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {session ? (
              <>
                <Link href="/profil">
                  <Button variant="ghost" size="icon" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all hover:scale-110 dark:hover:shadow-neon-sm">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all dark:hover:shadow-neon-sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all dark:hover:shadow-neon-sm"
                >
                  Çıkış
                </Button>
              </>
            ) : (
              <Link href="/giris">
                <Button variant="ghost" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all dark:hover:shadow-neon-sm">
                  Giriş
                </Button>
              </Link>
            )}

            <Link href="/sepet" className="relative">
              <Button variant="ghost" size="icon" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all hover:scale-110 relative dark:hover:shadow-neon-sm">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-accent to-accent-light text-xs flex items-center justify-center font-bold animate-scale-in dark:shadow-neon-pink">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border dark:border-primary/20 animate-fade-in bg-card/50 backdrop-blur-sm dark:bg-dark-card/50">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/kategoriler"
                className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kategoriler
              </Link>
              <Link
                href="/kampanyalar"
                className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kampanyalar
              </Link>
              <Link
                href="/kargo-takip"
                className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kargo Takip
              </Link>
              <Link
                href="/iletisim"
                className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white"
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

