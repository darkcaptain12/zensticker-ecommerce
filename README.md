# Zen Sticker E-Commerce

Premium araç sticker ve kaplama e-ticaret sitesi. Next.js 14, TypeScript, Prisma ve PostgreSQL ile geliştirilmiştir.

## 🚀 Özellikler

- **Modern Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Veritabanı**: PostgreSQL + Prisma ORM
- **Kimlik Doğrulama**: NextAuth.js ile email/şifre tabanlı
- **Ödeme**: PayTR entegrasyonu
- **Admin Panel**: Ürün, kategori, sipariş, kullanıcı yönetimi
- **Kişiye Özel Sticker**: Canlı önizleme ile özelleştirilebilir ürünler
- **Kargo Takip**: Sipariş ve kargo takip sistemi
- **SEO Optimizasyonu**: Meta tags, JSON-LD, sitemap
- **Responsive**: Mobil uyumlu tasarım
- **WhatsApp Desteği**: Floating buton ile WhatsApp entegrasyonu

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- npm veya yarn

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment değişkenlerini ayarlayın:**
`.env` dosyası oluşturun:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zensticker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# PayTR Configuration (Test mode)
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"
PAYTR_TEST_MODE="true"
```

3. **Veritabanını hazırlayın:**
```bash
npm run db:push
npm run db:generate
```

4. **Varlıkları kopyalayın:**
```bash
npm run copy-assets
```

5. **Veritabanını doldurun:**
```bash
npm run db:seed
```

6. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

Site `http://localhost:3000` adresinde çalışacaktır.

## 👤 Varsayılan Admin Hesabı

- **Email**: admin@zensticker.com
- **Şifre**: Admin123!

## 📁 Proje Yapısı

```
zensticker-ecommerce/
├── app/                    # Next.js App Router sayfaları
│   ├── admin/              # Admin panel sayfaları
│   ├── api/                # API routes
│   ├── kategori/           # Kategori sayfaları
│   ├── urun/               # Ürün sayfaları
│   └── ...
├── components/             # React bileşenleri
│   ├── ui/                 # shadcn/ui bileşenleri
│   └── admin/              # Admin bileşenleri
├── lib/                    # Yardımcı fonksiyonlar
├── prisma/                 # Prisma schema ve migrations
├── scripts/                # Yardımcı scriptler
└── public/                 # Statik dosyalar
```

## 🔧 Komutlar

- `npm run dev` - Geliştirme sunucusu
- `npm run build` - Production build
- `npm run start` - Production sunucu
- `npm run db:push` - Veritabanı şemasını güncelle
- `npm run db:seed` - Veritabanını doldur
- `npm run db:studio` - Prisma Studio'yu aç

## 📝 Önemli Notlar

1. **PayTR Entegrasyonu**: Test modunda çalışır. Production için gerçek credentials gerekir.
2. **Excel Import**: Seed scripti Excel dosyasını okumaya çalışır. Dosya yoksa manuel ürün eklenebilir.
3. **Admin Yetkisi**: Kullanıcı rolleri Prisma Studio'dan değiştirilebilir.
4. **Varlıklar**: Logo, banner ve ürün görselleri `public/` klasörüne kopyalanmalıdır.

## 🎨 Özelleştirme

- **Renkler**: `tailwind.config.ts` ve `app/globals.css` dosyalarından özelleştirilebilir
- **Site Ayarları**: Admin panelden yönetilebilir
- **Bannerlar**: Admin panelden yönetilebilir

## 📄 Lisans

Bu proje özel bir projedir.

# zensticker-ecommerce
