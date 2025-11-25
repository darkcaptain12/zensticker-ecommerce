# Otomatik Sipariş Temizleme - Cron Job Kurulumu

## Özellikler

- ✅ Her gece saat 02:00'de otomatik olarak tüm siparişler silinir
- ✅ Silinen siparişler JSON formatında log dosyasına kaydedilir
- ✅ Log dosyaları `/logs/` klasöründe saklanır
- ✅ Admin panelden manuel temizleme yapılabilir

## Vercel Cron Jobs (Önerilen)

### 1. Environment Variable Ekleyin

Vercel dashboard'da `CRON_SECRET` environment variable'ını ekleyin:

```
CRON_SECRET=your-very-secure-random-secret-key-here
```

### 2. vercel.json Güncelleyin

`vercel.json` dosyasındaki secret'ı environment variable'dan okuyacak şekilde güncelleyin:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-orders?secret=YOUR_CRON_SECRET_VALUE",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**ÖNEMLİ:** `YOUR_CRON_SECRET_VALUE` yerine gerçek secret değerini yazın (environment variable'dan değil, direkt değer).

### 3. Deploy Edin

Vercel'e deploy ettiğinizde cron job otomatik olarak aktif olacaktır.

## Alternatif: External Cron Service

Eğer Vercel Cron kullanmıyorsanız, external bir cron service kullanabilirsiniz:

### cron-job.org Kullanımı

1. https://cron-job.org adresine gidin
2. Yeni bir cron job oluşturun
3. URL: `https://yourdomain.com/api/cron/cleanup-orders?secret=YOUR_SECRET`
4. Schedule: Her gün saat 02:00 (Cron: `0 2 * * *`)
5. Method: GET

### EasyCron Kullanımı

1. https://www.easycron.com adresine gidin
2. Yeni bir cron job oluşturun
3. URL: `https://yourdomain.com/api/cron/cleanup-orders?secret=YOUR_SECRET`
4. Schedule: Her gün saat 02:00

## Log Dosyaları

Log dosyaları `logs/` klasöründe saklanır:

- Format: `order-cleanup-YYYY-MM-DD.json`
- İçerik: Silinen tüm siparişlerin detaylı bilgileri
- Erişim: Vercel'de log dosyalarına erişmek için Vercel dashboard'dan veya local'de `logs/` klasöründen erişebilirsiniz

## Manuel Temizleme

Admin panelden (`/admin`) "Son Siparişler" kartında "Tüm Siparişleri Temizle" butonuna tıklayarak manuel olarak temizleme yapabilirsiniz.

## Güvenlik

- Cron endpoint'i secret token ile korunmaktadır
- Sadece doğru secret ile çağrılabilir
- Admin panel endpoint'i NextAuth ile korunmaktadır

## Log Dosyası Formatı

```json
{
  "timestamp": "2024-01-15T02:00:00.000Z",
  "deletedOrders": 5,
  "orders": [
    {
      "id": "...",
      "orderNumber": "ZEN-...",
      "customerName": "...",
      "customerEmail": "...",
      "totalAmount": 150.00,
      "status": "DELIVERED",
      "items": [...]
    }
  ]
}
```

