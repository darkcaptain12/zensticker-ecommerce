'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/lib/cart-context'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

