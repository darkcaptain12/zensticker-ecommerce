'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FavoriteButton({ productId, className = '', size = 'md' }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (session) {
      checkFavorite()
    } else {
      setChecking(false)
    }
  }, [session, productId])

  const checkFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites/check?productId=${productId}`)
      const data = await response.json()
      setIsFavorited(data.isFavorited)
    } catch (error) {
      console.error('Error checking favorite:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/giris')
      return
    }

    setLoading(true)

    try {
      if (isFavorited) {
        const response = await fetch(`/api/favorites?productId=${productId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setIsFavorited(false)
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
        if (response.ok) {
          setIsFavorited(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return null
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={loading}
      variant="ghost"
      size="icon"
      className={`${sizeClasses[size]} ${className} ${
        isFavorited
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
          : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
    </Button>
  )
}

