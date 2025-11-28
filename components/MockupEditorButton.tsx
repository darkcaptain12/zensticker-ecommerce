'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'

export function MockupEditorButton() {
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    // Check if mockup editor is enabled
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.mockupEditorEnabled !== false)
      })
      .catch(() => {
        setIsEnabled(true) // Default to enabled if error
      })
  }, [])

  if (!isEnabled) {
    return null
  }

  return (
    <Link href="/mockup-editor">
      <Button
        className="fixed bottom-24 right-6 z-[9998] flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-purple-500/50 animate-float"
        size="lg"
      >
        <Palette className="h-5 w-5" />
        <span className="hidden sm:inline">Sticker Editörü</span>
      </Button>
    </Link>
  )
}

