'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CampaignPopup() {
  const [popup, setPopup] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Cookie kontrolü - pop-up daha önce kapatıldı mı?
    const popupClosed = localStorage.getItem('campaign-popup-closed')
    if (popupClosed) {
      return
    }

    // Pop-up verisini çek
    fetch('/api/campaign-popup')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.isActive) {
          setPopup(data)
          // Gecikme sonrası göster
          setTimeout(() => {
            setIsVisible(true)
          }, data.showDelay || 3000)
        }
      })
      .catch((error) => {
        console.error('Error fetching popup:', error)
      })
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Cookie'ye kaydet (30 gün)
    localStorage.setItem('campaign-popup-closed', 'true')
    // 30 gün sonra tekrar gösterilebilir
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)
    localStorage.setItem('campaign-popup-expiry', expiryDate.toISOString())
  }

  // Eğer 30 gün geçtiyse cookie'yi temizle
  useEffect(() => {
    if (!mounted) return
    
    const expiry = localStorage.getItem('campaign-popup-expiry')
    if (expiry) {
      const expiryDate = new Date(expiry)
      if (new Date() > expiryDate) {
        localStorage.removeItem('campaign-popup-closed')
        localStorage.removeItem('campaign-popup-expiry')
      }
    }
  }, [mounted])

  if (!mounted || !popup || !isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Kapatma Butonu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-dark-card/80 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Pop-up İçeriği */}
        <div className="p-6 md:p-8">
          {/* Görsel */}
          {popup.imageUrl && (
            <div className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
              <Image
                src={popup.imageUrl}
                alt={popup.title || 'Kampanya'}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Başlık */}
          {popup.title && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground dark:text-white">
              {popup.title}
            </h2>
          )}

          {/* Metin */}
          {popup.text && (
            <div
              className="text-foreground dark:text-gray-300 mb-6 prose prose-sm md:prose-base max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: popup.text }}
            />
          )}

          {/* Buton */}
          {popup.buttonText && popup.buttonUrl && (
            <div className="flex justify-center">
              <Link href={popup.buttonUrl} onClick={handleClose}>
                <Button size="lg" className="w-full md:w-auto">
                  {popup.buttonText}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

