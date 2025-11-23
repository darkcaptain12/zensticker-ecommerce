import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Providers } from '@/components/Providers'
import { DynamicStyles } from '@/components/DynamicStyles'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zen Sticker - Premium Araç Sticker ve Kaplama',
  description: 'Kaliteli araç sticker, kapı direk kaplama ve kişiye özel sticker çözümleri.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <DynamicStyles />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
          </div>
        </Providers>
      </body>
    </html>
  )
}
