'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  salePrice?: number | null
  images: Array<{ url: string; altText?: string | null }>
}

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    setAdding(true)
    const mainImage = product.images.find(img => img.url)?.url || '/placeholder-product.jpg'
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || undefined,
      image: mainImage,
      quantity: 1,
    })

    setTimeout(() => {
      setAdding(false)
      router.push('/sepet')
    }, 300)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={adding}
      className="w-full"
      size="sm"
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {adding ? 'Ekleniyor...' : 'Sepete Ekle'}
    </Button>
  )
}

