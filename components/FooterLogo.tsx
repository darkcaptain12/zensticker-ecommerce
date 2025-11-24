'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface FooterLogoProps {
  logoPath: string | null
}

export function FooterLogo({ logoPath }: FooterLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(logoPath || '/logo/beyaz_zensticker.png')

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setCurrentSrc('/logo/beyaz_zensticker.png')
    }
  }

  return (
    <Link href="/" className="inline-block">
      <div className="relative h-12 w-auto mb-4">
        <Image
          src={currentSrc}
          alt="Zen Sticker"
          width={140}
          height={50}
          className="h-12 w-auto object-contain"
          priority
          onError={handleError}
        />
      </div>
    </Link>
  )
}

