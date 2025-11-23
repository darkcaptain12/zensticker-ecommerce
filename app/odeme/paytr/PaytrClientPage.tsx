"use client";

import { useSearchParams } from "next/navigation";

export default function PaytrClientPage() {
  const searchParams = useSearchParams();

  // PayTR'den dönen parametrelerin isimlerini sen ne kullanıyorsan ona göre güncelle
  const status = searchParams.get("status"); // örnek
  const message = searchParams.get("message"); // örnek

  // Burayı PayTR entegrasyonuna göre özelleştirebilirsin
  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold mb-4">Ödeme Başarılı</h1>
        <p>Teşekkür ederiz. Siparişiniz alınmıştır.</p>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <h1 className="text-2xl font-semibold mb-4">Ödeme Başarısız</h1>
        <p>Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.</p>
        {message && <p className="text-sm text-gray-500 mt-4">{message}</p>}
      </div>
    );
  }

  // Parametre yoksa:
  return (
    <div className="max-w-lg mx-auto py-10 text-center">
      <h1 className="text-2xl font-semibold mb-4">Ödeme Durumu</h1>
      <p>Ödeme sonucu alınamadı. Eğer sorun yaşıyorsanız bizimle iletişime geçin.</p>
    </div>
  );
}