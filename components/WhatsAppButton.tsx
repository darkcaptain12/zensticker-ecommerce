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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 hover:scale-110"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  )
}

