import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function PayTRSuccessPage({
  searchParams,
}: {
  searchParams: { merchant_oid?: string }
}) {
  const orderNumber = searchParams.merchant_oid

  if (!orderNumber) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-4">Ödeme Başarılı!</h1>
      <p className="text-gray-600 mb-2">
        Sipariş numaranız: <strong>{orderNumber}</strong>
      </p>
      <p className="text-gray-600 mb-8">
        Siparişiniz alındı ve ödeme onaylandı. En kısa sürede kargoya verilecektir.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href={`/siparis-tesekkur/${orderNumber}`}>
          <Button>Sipariş Detayları</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
}

