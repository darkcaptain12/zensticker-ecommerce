import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Sayfa Bulunamadı</h2>
      <p className="text-gray-600 mb-8">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link href="/">
        <Button>
          <Home className="h-4 w-4 mr-2" />
          Ana Sayfaya Dön
        </Button>
      </Link>
    </div>
  )
}

