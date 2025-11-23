# Zen Sticker E-Commerce - Kurulum Rehberi

## Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. PostgreSQL Veritabanı Oluşturun
PostgreSQL'de yeni bir veritabanı oluşturun:
```sql
CREATE DATABASE zensticker;
```

### 3. Environment Değişkenlerini Ayarlayın
`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zensticker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here-min-32-chars"

# PayTR Configuration (Test mode için placeholder değerler)
PAYTR_MERCHANT_ID="test-merchant-id"
PAYTR_MERCHANT_KEY="test-merchant-key"
PAYTR_MERCHANT_SALT="test-merchant-salt"
PAYTR_TEST_MODE="true"
```

**Önemli**: `NEXTAUTH_SECRET` için güçlü bir random string kullanın. Örnek:
```bash
openssl rand -base64 32
```

### 4. Veritabanı Şemasını Oluşturun
```bash
npm run db:push
npm run db:generate
```

### 5. Varlıkları Kopyalayın
Logo, banner ve ürün görsellerini `public/` klasörüne kopyalayın:
```bash
npm run copy-assets
```

Veya manuel olarak:
- `logo/` → `public/logo/`
- `banner/` → `public/banner/`
- `ürün_görselleri/` → `public/products/`

### 6. Veritabanını Doldurun
Seed scripti çalıştırın:
```bash
npm run db:seed
```

Bu script:
- Varsayılan kategorileri oluşturur
- Admin kullanıcısı oluşturur (admin@zensticker.com / Admin123!)
- Site ayarlarını oluşturur
- Excel dosyasından ürünleri import eder (eğer varsa)
- Varsayılan bannerları oluşturur
- Statik sayfaları oluşturur

### 7. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Site `http://localhost:3000` adresinde çalışacaktır.

## Varsayılan Giriş Bilgileri

**Admin:**
- Email: `admin@zensticker.com`
- Şifre: `Admin123!`

## Önemli Notlar

### Excel Import
Seed scripti `Ürünleriniz_22.11.2025-22.22.xlsx` dosyasını okumaya çalışır. Dosya yoksa veya format uyumsuzsa, ürünleri admin panelden veya Prisma Studio'dan ekleyebilirsiniz.

### PayTR Entegrasyonu
- Test modunda çalışır (PAYTR_TEST_MODE="true")
- Production için gerçek PayTR credentials gerekir
- PayTR dokümantasyonuna göre yapılandırın

### Admin Yetkisi
Kullanıcı rolleri Prisma Studio'dan değiştirilebilir:
```bash
npm run db:studio
```

### Ürün Görselleri
Ürün görselleri `public/products/` klasöründe olmalıdır. Seed scripti görselleri otomatik olarak ilişkilendirmeye çalışır.

## Sorun Giderme

### Veritabanı Bağlantı Hatası
- PostgreSQL'in çalıştığından emin olun
- DATABASE_URL'in doğru olduğunu kontrol edin
- Veritabanının oluşturulduğunu kontrol edin

### Build Hataları
```bash
npm run build
```
Hataları kontrol edin ve düzeltin.

### Prisma Client Hatası
```bash
npm run db:generate
```

### Port Zaten Kullanılıyor
Farklı bir port kullanın:
```bash
PORT=3001 npm run dev
```

## Production Deployment

1. Environment değişkenlerini production değerleriyle güncelleyin
2. `npm run build` ile build alın
3. `npm run start` ile production sunucusunu başlatın
4. PayTR credentials'ları production değerleriyle güncelleyin
5. SSL sertifikası kurun (HTTPS gerekli)

## Destek

Sorunlar için GitHub Issues kullanın veya dokümantasyonu kontrol edin.

