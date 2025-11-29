'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { ScrollAnimation } from './ScrollAnimation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: Array<{ url: string; altText?: string | null }>
  stock: number
  variants?: Array<{
    id: string
    name: string
    value: string
    stock: number
  }>
  category: { name: string }
  finalPrice?: number
  originalPrice?: number | null
  hasCampaign?: boolean
}

interface ProductShowcaseProps {
  products: Product[]
  title?: string
  showViewAll?: boolean
}

export function ProductShowcase({ products, title = 'Öne Çıkan Ürünler', showViewAll = true }: ProductShowcaseProps) {

  return (
    <section className="py-20 bg-background dark:bg-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2300e0ff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <ScrollAnimation direction="up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{title}</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                En popüler ve kaliteli ürünlerimiz
              </p>
            </div>

            {showViewAll && (
              <Link href="/kategoriler">
                <Button className="btn-modern bg-gradient-to-r from-primary to-accent text-white hover:shadow-neon-lg">
                  Tümünü Gör
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </ScrollAnimation>

        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 md:gap-6 min-w-max">
            {products.map((product, index) => {
              const finalPrice = product.finalPrice ?? (product.salePrice || product.price)
              const originalPrice = product.originalPrice ?? (product.salePrice ? product.price : null)
              const hasCampaign = product.hasCampaign ?? false
              return (
                <div key={product.id} className="w-[280px] sm:w-[300px] flex-shrink-0">
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      salePrice: product.salePrice,
                      images: product.images,
                      stock: product.stock,
                      variants: product.variants,
                    }}
                    finalPrice={finalPrice}
                    originalPrice={originalPrice}
                    hasCampaign={hasCampaign}
                    hasSale={!!product.salePrice}
                  />
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}

