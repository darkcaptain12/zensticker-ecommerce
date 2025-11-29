'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu, Heart, Palette } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { useTheme } from 'next-themes'
import { HeaderMarquee } from './HeaderMarquee'
import { SearchBar } from './SearchBar'
import { CategoryDropdown } from './CategoryDropdown'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { data: session, status } = useSession()
  const { itemCount } = useCart()
  const { theme, systemTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mockupEditorEnabled, setMockupEditorEnabled] = useState(true)
  const currentTheme = theme === 'system' ? systemTheme : theme
  
  // Debug: Session durumunu logla
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Header - Session authenticated:', session)
    }
  }, [session, status])
  
  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check if mockup editor is enabled
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        setMockupEditorEnabled(data.mockupEditorEnabled !== false)
      })
      .catch(() => {
        setMockupEditorEnabled(true) // Default to enabled if error
      })
  }, [])

  // Logo path: tema bazlı - açık temada siyah, koyu temada beyaz
  // SSR için default siyah logo, client-side'da tema değişince güncellenir
  const logoPath = (!mounted || currentTheme === 'light') 
    ? '/logo/siyah_zensticker.png' 
    : '/logo/beyaz_zensticker.png'

  return (
    <>
      <HeaderMarquee />
      <header className={`sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md text-foreground shadow-sm dark:border-primary/20 dark:bg-dark-soft/80 dark:text-white dark:shadow-neon-sm transition-all duration-300 ${
        scrolled ? 'py-2' : ''
      }`}>
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className={`flex items-center justify-between transition-all duration-300 gap-2 ${
          scrolled ? 'h-12' : 'h-14 md:h-16'
        }`}>
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity group flex-shrink-0">
            <div className="relative h-7 md:h-9 w-auto">
              {mounted ? (
                <Image
                  key={currentTheme} // Tema değişince yeniden render
                  src={logoPath}
                  alt="Zen Sticker"
                  width={100}
                  height={35}
                  className="h-7 md:h-9 w-auto object-contain"
                  priority
                />
              ) : (
                <Image
                  src="/logo/siyah_zensticker.png"
                  alt="Zen Sticker"
                  width={100}
                  height={35}
                  className="h-7 md:h-9 w-auto object-contain"
                  priority
                  suppressHydrationWarning
                />
              )}
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center min-w-0">
            <Link href="/" className="px-2.5 py-1.5 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white whitespace-nowrap text-sm">
              Ana Sayfa
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
            <CategoryDropdown />
            <Link href="/kampanyalar" className="px-2.5 py-1.5 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white whitespace-nowrap text-sm">
              Kampanyalar
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
            {mockupEditorEnabled && (
              <Link href="/mockup-editor" className="px-2.5 py-1.5 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white whitespace-nowrap text-sm">
                <Palette className="h-3.5 w-3.5 inline mr-1" />
                Sticker Editörü
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
                <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
              </Link>
            )}
            <Link href="/kargo-takip" className="px-2.5 py-1.5 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white whitespace-nowrap text-sm">
              Kargo Takip
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
            <Link href="/iletisim" className="px-2.5 py-1.5 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-all font-medium relative group text-foreground dark:text-white whitespace-nowrap text-sm">
              İletişim
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full dark:shadow-neon-sm"></span>
              <span className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {status === 'authenticated' && session?.user ? (
              <>
                <Link href="/profil/favoriler">
                  <Button variant="ghost" size="icon" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all hover:scale-110 dark:hover:shadow-neon-sm relative h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profil">
                  <Button variant="ghost" size="icon" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all hover:scale-110 dark:hover:shadow-neon-sm h-8 w-8">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all dark:hover:shadow-neon-sm text-sm px-2 py-1 h-8">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all dark:hover:shadow-neon-sm text-sm px-2 py-1 h-8"
                >
                  Çıkış
                </Button>
              </>
            ) : status === 'loading' ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : (
              <Link href="/giris">
                <Button variant="ghost" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all dark:hover:shadow-neon-sm text-sm px-2 py-1 h-8">
                  Giriş
                </Button>
              </Link>
            )}

            <Link href="/sepet" className="relative">
              <Button variant="ghost" size="icon" className="text-foreground dark:text-white hover:bg-primary/20 hover:text-primary rounded-lg transition-all hover:scale-110 relative dark:hover:shadow-neon-sm h-8 w-8">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-accent to-accent-light text-[10px] flex items-center justify-center font-bold animate-scale-in dark:shadow-neon-pink">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground dark:text-white h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              <Menu className="h-4 w-4" />
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
              {mockupEditorEnabled && (
                <Link
                  href="/mockup-editor"
                  className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Palette className="h-4 w-4" />
                  Sticker Editörü
                </Link>
              )}
              {session && (
                <Link
                  href="/profil/favoriler"
                  className="px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-md transition-all font-medium text-foreground dark:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favorilerim
                </Link>
              )}
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

