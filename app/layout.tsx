import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { MockupEditorButton } from '@/components/MockupEditorButton'
import { Providers } from '@/components/Providers'
import { DynamicStyles } from '@/components/DynamicStyles'
import { Toaster } from '@/components/ui/toaster'
import { CampaignPopup } from '@/components/CampaignPopup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Zen Sticker - Premium Araç Sticker ve Kaplama',
    template: '%s | Zen Sticker',
  },
  description: 'Kaliteli araç sticker, kapı direk kaplama ve kişiye özel sticker çözümleri. 200₺ üzeri ücretsiz kargo.',
  keywords: ['araç sticker', 'kapı direk kaplama', 'özel tasarım sticker', 'arac kaplama', 'sticker', 'zen sticker'],
  authors: [{ name: 'Zen Sticker' }],
  creator: 'Zen Sticker',
  publisher: 'Zen Sticker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    siteName: 'Zen Sticker',
    title: 'Zen Sticker - Premium Araç Sticker ve Kaplama',
    description: 'Kaliteli araç sticker, kapı direk kaplama ve kişiye özel sticker çözümleri.',
  },
  twitter: {
    card: 'summary_large_image',
  title: 'Zen Sticker - Premium Araç Sticker ve Kaplama',
  description: 'Kaliteli araç sticker, kapı direk kaplama ve kişiye özel sticker çözümleri.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo/zs_siyah.png',
    shortcut: '/logo/zs_siyah.png',
    apple: '/logo/zs_siyah.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <DynamicStyles />
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <MockupEditorButton />
            <WhatsAppButton />
            <CampaignPopup />
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}
