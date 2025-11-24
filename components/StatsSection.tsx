'use client'

import { Truck, Shield, Award, Clock, Users, Star } from 'lucide-react'

const stats = [
  {
    icon: Truck,
    value: 'Aynı Gün',
    label: 'Kargo',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    delay: '0s',
  },
  {
    icon: Shield,
    value: '256-bit',
    label: 'Güvenli Ödeme',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    delay: '0.1s',
  },
  {
    icon: Award,
    value: 'Premium',
    label: 'Kalite Garantisi',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    delay: '0.2s',
  },
  {
    icon: Clock,
    value: '7/24',
    label: 'Müşteri Desteği',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    delay: '0.3s',
  },
  {
    icon: Users,
    value: '1000+',
    label: 'Mutlu Müşteri',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    delay: '0.4s',
  },
  {
    icon: Star,
    value: '5.0',
    label: 'Müşteri Puanı',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    delay: '0.5s',
  },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-dark dark:via-dark-soft dark:to-dark-card">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="text-center group cursor-pointer"
                style={{ animationDelay: stat.delay }}
              >
                <div className={`${stat.bgColor} dark:bg-dark-card dark:border dark:border-primary/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 dark:group-hover:border-primary dark:group-hover:shadow-neon-sm transition-all duration-300`}>
                  <Icon className={`h-10 w-10 ${stat.color}`} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
