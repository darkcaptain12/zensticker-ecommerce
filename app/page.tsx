import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, TrendingUp } from 'lucide-react'
import { BannerSlider } from '@/components/BannerSlider'
import { ProductCard } from '@/components/ProductCard'
import { Suspense } from 'react'
import { ProductCardSkeleton } from '@/components/SkeletonLoader'
import { HeroSection } from '@/components/HeroSection'
import { StatsSection } from '@/components/StatsSection'
import { FeaturesShowcase } from '@/components/FeaturesShowcase'
import { NewsletterSection } from '@/components/NewsletterSection'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { SocialProofSectionWrapper } from '@/components/SocialProofSectionWrapper'
import { CategoryShowcase } from '@/components/CategoryShowcase'
import { VideoBackgroundSection } from '@/components/VideoBackgroundSection'
import { ProductShowcase } from '@/components/ProductShowcase'

// Revalidate every 60 seconds to ensure fresh data
export const revalidate = 60

export default async function HomePage() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
    take: 3,
    select: {
      id: true,
      title: true,
      type: true,
      filePath: true,
      linkUrl: true,
    },
  })

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    take: 6,
  })

  // Fetch featured products with proper IDs and fresh data
  const featuredProducts = await prisma.product.findMany({
    where: { 
      isActive: true,
      stock: { gt: 0 }, // Only show products in stock
    },
    include: {
      images: { 
        where: { isMain: true }, 
        take: 1,
        orderBy: { createdAt: 'asc' }, // Consistent image selection
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      campaign: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        select: {
          id: true,
          discountPercent: true,
          discountAmount: true,
          startDate: true,
          endDate: true,
          isActive: true,
        },
      },
    },
    take: 8,
    orderBy: [
      { updatedAt: 'desc' }, // Show recently updated products first
      { createdAt: 'desc' }
    ],
  })

  return (
    <div className="overflow-hidden">
      {/* Banner Slider */}
      {banners.length > 0 && (
        <section className="bg-background">
          <BannerSlider banners={banners} />
        </section>
      )}

      {/* Modern Hero Section */}
      <HeroSection />

      {/* Featured Products - Hemen Hero Section Altında */}
      <Suspense fallback={
        <div className="py-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 container mx-auto px-4">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }>
        <ProductShowcase products={featuredProducts} />
      </Suspense>

      {/* Stats Section */}
      <StatsSection />

      {/* Social Proof */}
      <SocialProofSectionWrapper />

      {/* Category Showcase */}
      <CategoryShowcase categories={categories} />

      {/* Features Showcase */}
      <FeaturesShowcase />

      {/* Video Background Section */}
      <VideoBackgroundSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  )
}

