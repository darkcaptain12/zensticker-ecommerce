'use client'

import { useEffect, useState } from 'react'

export function HeaderMarquee() {
  const [marqueeText, setMarqueeText] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.headerMarqueeText) {
          setMarqueeText(data.headerMarqueeText)
        }
      })
      .catch(() => {})
  }, [])

  if (!marqueeText) return null

  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative">
      <div className="marquee-container">
        <div className="marquee-content">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="inline-block px-8 whitespace-nowrap">
              {marqueeText}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

