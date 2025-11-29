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

  const fetchPopup = () => {
    // Cache-busting için timestamp ekle
    fetch(`/api/campaign-popup?t=${Date.now()}`, {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.isActive) {
          // Popup güncellendi mi kontrol et
          const lastPopupId = localStorage.getItem('campaign-popup-id')
          const currentPopupId = `${data.id}-${data.updatedAt || data.createdAt}`
          
          // Eğer popup değiştiyse localStorage'ı temizle ve göster
          const popupChanged = lastPopupId && lastPopupId !== currentPopupId
          if (popupChanged) {
            localStorage.removeItem('campaign-popup-closed')
            localStorage.removeItem('campaign-popup-expiry')
          }
          
          // Yeni popup ID'sini kaydet
          localStorage.setItem('campaign-popup-id', currentPopupId)
          
          setPopup(data)
          
          // Popup kapalı değilse veya değiştiyse göster
          const popupClosed = localStorage.getItem('campaign-popup-closed')
          if (!popupClosed || popupChanged) {
            // Gecikme sonrası göster
            setTimeout(() => {
              setIsVisible(true)
            }, data.showDelay || 3000)
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching popup:', error)
      })
  }

  useEffect(() => {
    setMounted(true)
    
    // Pop-up verisini çek (güncellenmiş olabilir)
    fetchPopup()
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
      <div className="relative max-w-2xl w-full max-h-[90vh] animate-scale-in flex flex-col">
        {/* Kapatma Butonu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Görsel - Pop-up'ın tamamını kaplar */}
        {popup.imageUrl && (
          <div className="relative w-full flex-1 min-h-[400px] max-h-[85vh] rounded-2xl overflow-hidden">
            <Image
              src={popup.imageUrl}
              alt={popup.title || 'Kampanya'}
              fill
              className="object-contain"
              priority
              unoptimized={popup.imageUrl.includes('supabase.co') || popup.imageUrl.includes('supabase.in')}
            />
          </div>
        )}

        {/* Buton - Görselin hemen altında */}
        {popup.buttonText && popup.buttonUrl && (
          <div className="flex justify-center mt-4">
            <Link href={popup.buttonUrl} onClick={handleClose}>
              <Button size="lg" className="w-full md:w-auto bg-black text-white hover:bg-gray-800">
                {popup.buttonText}
              </Button>
            </Link>
          </div>
        )}

        {/* Görsel yoksa başlık ve metin göster */}
        {!popup.imageUrl && (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 md:p-8">
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
          </div>
        )}
      </div>
    </div>
  )
}

