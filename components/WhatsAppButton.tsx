'use client'

import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('+905551234567')

  useEffect(() => {
    // Fetch phone number from site settings
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.whatsappPhoneNumber) {
          setPhoneNumber(data.whatsappPhoneNumber)
        }
      })
      .catch(() => {})
  }, [])

  const handleClick = () => {
    const message = encodeURIComponent('Merhaba, Zen Sticker hakkında bilgi almak istiyorum.')
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`
    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-green-500/50 animate-float group"
      style={{ position: 'fixed' }}
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
    </button>
  )
}

