'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    id: 1,
    name: 'Ahmet Yılmaz',
    role: 'Araç Sahibi',
    image: '/api/placeholder/60/60',
    rating: 5,
    text: 'Harika bir hizmet! Sticker kalitesi mükemmel ve uygulama çok profesyonel. Aracım artık çok daha şık görünüyor. Kesinlikle tavsiye ederim.',
    product: 'Kapı Direk Kaplama',
  },
  {
    id: 2,
    name: 'Zeynep Demir',
    role: 'İşletme Sahibi',
    image: '/api/placeholder/60/60',
    rating: 5,
    text: 'Firmamız için toplu sipariş verdik. Hem fiyat hem kalite açısından çok memnun kaldık. Hızlı teslimat ve müşteri desteği de harika.',
    product: 'Özel Tasarım Sticker',
  },
  {
    id: 3,
    name: 'Mehmet Kaya',
    role: 'Otomobil Tutkunu',
    image: '/api/placeholder/60/60',
    rating: 5,
    text: 'Kişiye özel tasarım seçeneği sayesinde tam istediğim gibi bir sticker yaptırdım. Kalite gerçekten premium seviyede.',
    product: 'Kişiye Özel Sticker',
  },
  {
    id: 4,
    name: 'Ayşe Şahin',
    role: 'Araç Sahibi',
    image: '/api/placeholder/60/60',
    rating: 5,
    text: 'Aynı gün kargo hizmeti gerçekten çok hızlı. Ürün beklediğimden çok daha kaliteli çıktı. Çok memnunum!',
    product: 'Premium Sticker Paketi',
  },
  {
    id: 5,
    name: 'Can Öztürk',
    role: 'Tuning Meraklısı',
    image: '/api/placeholder/60/60',
    rating: 5,
    text: 'Aracımın görünümünü tamamen değiştirdi. Hava koşullarına dayanıklılığı da harika. 6 aydır hiç sorun yok.',
    product: 'Tam Kaplama Seti',
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-dark-soft dark:via-dark-card dark:to-dark-soft relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full filter blur-xl opacity-40 animate-float" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 rounded-full filter blur-xl opacity-40 animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-sm text-primary">Müşteri Yorumları</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Müşterilerimiz Ne Diyor?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Binlerce mutlu müşterimizin deneyimlerini keşfedin
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="card-modern border border-border dark:border-dark-border relative overflow-hidden bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl" />
            
            <CardContent className="p-8 md:p-12 relative z-10">
              <Quote className="h-12 w-12 text-primary/60 mb-6" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < currentTestimonial.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-500'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-foreground/90 dark:text-gray-200 mb-8 leading-relaxed italic">
                "{currentTestimonial.text}"
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl dark:shadow-neon-sm">
                    {currentTestimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{currentTestimonial.name}</h4>
                    <p className="text-muted-foreground">{currentTestimonial.role}</p>
                    <p className="text-sm text-primary font-medium mt-1">{currentTestimonial.product}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrevious}
                    className="rounded-full hover:bg-primary/20 border-dark-border text-white hover:border-primary"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
                    className="rounded-full hover:bg-primary/20 border-dark-border text-white hover:border-primary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Dots */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-primary to-accent'
                  : 'w-3 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-muted-foreground">Ortalama Puan</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-2">1000+</div>
            <div className="text-muted-foreground">Değerlendirme</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-light mb-2">%98</div>
            <div className="text-muted-foreground">Memnuniyet Oranı</div>
          </div>
        </div>
      </div>
    </section>
  )
}

