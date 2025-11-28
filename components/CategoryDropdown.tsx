'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
}

export function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) {
          setCategories(data.categories)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="px-2.5 py-1.5 rounded-md hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors font-medium flex items-center gap-1 text-sm text-foreground dark:text-white whitespace-nowrap"
      >
        Kategoriler
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && categories.length > 0 && (
        <div
          className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-2 z-50"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="block px-4 py-3 hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="font-medium text-white">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                  {category.description}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

