'use client'
export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PayTRPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const orderNumber = searchParams.get('orderNumber')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.push('/odeme')
      return
    }

    // PayTR iframe will be loaded here
    setLoading(false)
  }, [token, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Ödeme sayfası yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Ödeme</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          id="paytriframe"
          width="100%"
          height="600"
          style={{ border: 'none' }}
          allow="payment"
        />
      </div>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Ödeme işleminiz tamamlandıktan sonra yönlendirileceksiniz.
      </p>
    </div>
  )
}
