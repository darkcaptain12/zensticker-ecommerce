'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [campaignDiscount, setCampaignDiscount] = useState<CampaignDiscount | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
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
      const existing = prev.find(i => i.productId === item.productId && i.customText === item.customText)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId && i.customText === item.customText
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

