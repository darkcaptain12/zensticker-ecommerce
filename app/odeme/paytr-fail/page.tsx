import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default function PayTRFailPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <XCircle className="h-24 w-24 mx-auto text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-4">Ödeme Başarısız</h1>
      <p className="text-gray-600 mb-8">
        Ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi seçin.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/sepet">
          <Button>Sepete Dön</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
}

