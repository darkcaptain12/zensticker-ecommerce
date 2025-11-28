'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface SearchProduct {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: Array<{ url: string }>
  category: { name: string }
  campaign?: {
    discountPercent?: number | null
    discountAmount?: number | null
    isActive?: boolean
    startDate?: Date | string
    endDate?: Date | string
  } | null
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchProducts(query.trim())
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  const searchProducts = async (searchTerm: string) => {
    if (searchTerm.length < 2) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&limit=5`)
      const data = await response.json()
      setResults(data.products || [])
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setIsOpen(false)
      setShowResults(false)
    }
  }

  const handleProductClick = () => {
    setQuery('')
    setIsOpen(false)
    setShowResults(false)
  }

  const calculatePrice = (product: SearchProduct) => {
    let finalPrice = product.salePrice || product.price
    let originalPrice = product.salePrice ? product.price : null

    if (product.campaign && product.campaign.isActive) {
      const now = new Date()
      const startDate = product.campaign.startDate ? new Date(product.campaign.startDate) : null
      const endDate = product.campaign.endDate ? new Date(product.campaign.endDate) : null

      if ((!startDate || now >= startDate) && (!endDate || now <= endDate)) {
        if (product.campaign.discountPercent) {
          originalPrice = finalPrice
          finalPrice = finalPrice - (finalPrice * product.campaign.discountPercent / 100)
        } else if (product.campaign.discountAmount) {
          originalPrice = finalPrice
          finalPrice = Math.max(0, finalPrice - product.campaign.discountAmount)
        }
      }
    }
    return { finalPrice, originalPrice }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="Ara"
      >
        <Search className="h-5 w-5 text-white" />
      </button>
    )
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-xs">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ürün ara..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.trim().length >= 2) {
                setShowResults(true)
              }
            }}
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true)
              }
            }}
            className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setQuery('')
            setResults([])
            setShowResults(false)
          }}
          className="text-white hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {results.map((product) => {
            const { finalPrice, originalPrice } = calculatePrice(product)
            const mainImage = product.images[0]?.url || '/placeholder-product.jpg'

            return (
              <Link
                key={product.id}
                href={`/urun/${product.slug}`}
                onClick={handleProductClick}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
              >
                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{product.name}</div>
                  <div className="text-sm text-gray-400">{product.category.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {originalPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(originalPrice)}
                      </span>
                    )}
                    <span className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      }).format(finalPrice)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
          {query.trim().length >= 2 && (
            <Link
              href={`/arama?q=${encodeURIComponent(query.trim())}`}
              onClick={handleProductClick}
              className="block px-4 py-3 text-center text-sm text-primary hover:bg-gray-800 border-t border-gray-800 font-medium"
            >
              Tüm sonuçları gör ({results.length}+)
            </Link>
          )}
        </div>
      )}

      {showResults && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 z-50">
          <p className="text-gray-400 text-sm text-center">
            &quot;{query}&quot; için sonuç bulunamadı
          </p>
        </div>
      )}
    </div>
  )
}
