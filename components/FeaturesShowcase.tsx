'use client'

import { CheckCircle2, Zap, Palette, Truck, Shield, Headphones } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Palette,
    title: 'Kişiye Özel Tasarım',
    description: 'Aracınıza özel tasarım yapabilir, istediğiniz renk ve font seçeneklerini kullanabilirsiniz.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Hızlı Üretim',
    description: 'Siparişleriniz 24 saat içinde hazırlanır ve aynı gün kargoya verilir.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Kalite Garantisi',
    description: 'Tüm ürünlerimiz premium kalitede, hava koşullarına dayanıklı ve uzun ömürlüdür.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Truck,
    title: 'Ücretsiz Kargo',
    description: '200₺ üzeri tüm siparişlerde ücretsiz kargo imkanı. Hızlı ve güvenli teslimat.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Headphones,
    title: '7/24 Destek',
    description: 'Müşteri destek ekibimiz her zaman yanınızda. Sorularınız için bize ulaşın.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: CheckCircle2,
    title: 'Kolay Uygulama',
    description: 'Kendiniz kolayca uygulayabilir veya profesyonel uygulama hizmetimizden yararlanabilirsiniz.',
    color: 'from-pink-500 to-rose-500',
  },
]

export function FeaturesShowcase() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-soft relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300e0ff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Neden Bizi Seçmelisiniz?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium kalite, hızlı teslimat ve müşteri memnuniyeti odaklı hizmet anlayışımız
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="card-modern border border-border dark:border-dark-border hover:border-primary/50 relative overflow-hidden group bg-card dark:bg-dark-card/50 backdrop-blur-sm rounded-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
                
                <CardContent className="p-8 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
