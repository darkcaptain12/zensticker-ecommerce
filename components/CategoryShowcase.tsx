'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ScrollAnimation } from './ScrollAnimation'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
}

interface CategoryShowcaseProps {
  categories: Category[]
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-dark-soft dark:to-dark-card relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-40 animate-float" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '3s' }} />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <ScrollAnimation direction="up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Kategorilerimiz</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Her İhtiyaca Uygun Çözüm</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Geniş ürün yelpazemizle aracınız için en uygun sticker ve kaplama çözümünü bulun
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <ScrollAnimation key={category.id} direction="up" delay={index * 100}>
              <Link href={`/kategori/${category.slug}`}>
                <Card className="card-modern group h-full border border-border dark:border-dark-border hover:border-primary/50 overflow-hidden relative bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 rounded-2xl" />
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 dark:shadow-neon-sm">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-muted-foreground mb-6 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                      <span>Keşfet</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardContent>

                  {/* Decorative Element */}
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/20 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </Link>
            </ScrollAnimation>
          ))}
        </div>

        {/* View All Button */}
        <ScrollAnimation direction="up" delay={categories.length * 100}>
          <div className="text-center mt-12">
            <Link href="/kategoriler">
              <button className="btn-modern px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold text-lg hover:shadow-lg dark:hover:shadow-neon-lg hover:scale-105 transition-all duration-300">
                Tüm Kategorileri Gör
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  )
}

