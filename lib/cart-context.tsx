'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
  variantId?: string // Seçilen varyant ID'si
  customText?: string
  customFont?: string
}

interface CampaignDiscount {
  id: string
  title: string
  discountPercent?: number | null
  discountAmount?: number | null
  calculatedDiscount: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  total: number
  campaignDiscount: CampaignDiscount | null
  subtotal: number // Total before campaign discount
  finalTotal: number // Total after campaign discount
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [campaignDiscount, setCampaignDiscount] = useState<CampaignDiscount | null>(null)

  useEffect(() => {
    // Try to load from cookie first (for cross-device compatibility)
    const cookieCart = getCookie('cart')
    if (cookieCart) {
      try {
        setItems(JSON.parse(cookieCart))
        return
      } catch (e) {
        console.error('Error parsing cookie cart:', e)
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setItems(parsed)
        // Sync to cookie
        setCookie('cart', saved)
      } catch (e) {
        console.error('Error parsing localStorage cart:', e)
      }
    }
  }, [])

  useEffect(() => {
    // Save to both localStorage and cookie
    const cartData = JSON.stringify(items)
    localStorage.setItem('cart', cartData)
    setCookie('cart', cartData)
  }, [items])

  // Check for campaign discounts when cart total changes
  useEffect(() => {
    const checkCampaign = async () => {
      const subtotal = items.reduce(
        (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
        0
      )

      if (subtotal > 0) {
        try {
          const response = await fetch('/api/campaigns/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartTotal: subtotal }),
          })
          const data = await response.json()
          setCampaignDiscount(data.campaign)
        } catch (error) {
          console.error('Error checking campaigns:', error)
          setCampaignDiscount(null)
        }
      } else {
        setCampaignDiscount(null)
      }
    }

    checkCampaign()
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      // Aynı ürün + aynı varyant + aynı customText kombinasyonunu bul
      const existing = prev.find(i => 
        i.productId === item.productId && 
        i.variantId === item.variantId && 
        i.customText === item.customText
      )
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && 
          i.variantId === item.variantId && 
          i.customText === item.customText
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(i => (i.productId === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
    0
  )
  
  // Apply campaign discount
  const discountAmount = campaignDiscount?.calculatedDiscount || 0
  const finalTotal = Math.max(0, subtotal - discountAmount)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total: finalTotal, // Keep 'total' for backward compatibility
        campaignDiscount,
        subtotal,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

