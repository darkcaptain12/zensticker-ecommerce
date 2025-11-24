# Zen Sticker E-Commerce Platform

## 📋 Proje Özeti

Zen Sticker, araç sticker ve kaplama ürünleri için geliştirilmiş modern bir e-ticaret platformudur. Next.js 14 App Router, Prisma ORM, PostgreSQL ve PayTR ödeme entegrasyonu kullanılarak geliştirilmiştir. Platform, müşteri tarafı ve kapsamlı bir admin paneli içermektedir.

## 🚀 Teknoloji Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **React Quill** - Rich text editor
- **Lucide React** - Icon library
- **NextAuth.js** - Authentication

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **PayTR** - Payment gateway integration

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prisma Studio** - Database GUI
- **TestSprite** - Automated testing framework

## 📁 Proje Yapısı

```
zensticker-ecommerce/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin panel pages
│   │   ├── banner/              # Banner management
│   │   ├── kampanyalar/         # Campaign management
│   │   ├── kategoriler/         # Category management
│   │   ├── kullanicilar/        # User management
│   │   ├── siparisler/          # Order management
│   │   ├── site-ayarlari/       # Site settings
│   │   ├── static-pages/        # Static page management
│   │   └── urunler/             # Product management
│   ├── api/                      # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── campaigns/            # Campaign API
│   │   ├── categories/          # Category API
│   │   ├── paytr/               # PayTR payment API
│   │   ├── search/              # Search API
│   │   └── site-settings/       # Site settings API
│   ├── arama/                    # Search results page
│   ├── giris/                    # Login page
│   ├── kayit/                    # Registration page
│   ├── kampanyalar/              # Campaign listing page
│   ├── kampanya/[id]/           # Campaign detail page
│   ├── kategori/[slug]/         # Category page
│   ├── kategoriler/             # Category listing page
│   ├── kargo-takip/             # Order tracking page
│   ├── odeme/                    # Checkout page
│   ├── profil/                   # User profile page
│   ├── sepet/                    # Shopping cart page
│   ├── siparis-tesekkur/        # Order thank you page
│   ├── urun/[slug]/             # Product detail page
│   └── [slug]/                   # Dynamic static pages
├── components/                    # React components
│   ├── admin/                   # Admin panel components
│   ├── ui/                      # Reusable UI components
│   └── [feature components]     # Feature-specific components
├── lib/                          # Utility libraries
│   ├── prisma.ts                # Prisma client
│   ├── auth.ts                  # NextAuth configuration
│   └── cart-context.tsx         # Shopping cart context
├── prisma/                       # Database schema
│   └── schema.prisma            # Prisma schema file
├── public/                       # Static assets
│   ├── images/                  # Image assets
│   ├── videos/                  # Video assets
│   └── logo/                    # Logo files
└── scripts/                      # Utility scripts
    └── seed.ts                  # Database seeding script
```

## 🗄️ Veritabanı Yapısı

### Ana Modeller

#### User (Kullanıcı)
- Kullanıcı bilgileri ve roller (CUSTOMER, ADMIN)
- Şifre hash'leme ile güvenli saklama

#### Category (Kategori)
- Ürün kategorileri
- Slug bazlı URL yapısı
- Aktif/pasif durumu

#### Product (Ürün)
- Ürün bilgileri (isim, açıklama, fiyat, stok)
- Kategori ilişkisi
- Kampanya ilişkisi
- Özelleştirilebilir ürün desteği
- Çoklu görsel ve video desteği

#### ProductImage (Ürün Görseli)
- Ürün görselleri ve videoları
- Ana görsel işaretleme
- Video/Resim ayrımı

#### Order (Sipariş)
- Sipariş bilgileri
- Müşteri bilgileri
- Sipariş durumları (PENDING, PAID, SHIPPED, DELIVERED, vb.)
- PayTR entegrasyonu
- Kampanya indirimi desteği

#### Campaign (Kampanya)
- 4 farklı kampanya tipi:
  - **GENERAL**: Genel kampanya (minimum alışveriş tutarına göre)
  - **CATEGORY**: Kategori bazlı kampanya
  - **PRODUCT**: Ürün bazlı kampanya
  - **PACKAGE**: Paket kampanyası (sabit fiyat, çoklu ürün)
- Yüzde veya sabit tutar indirimi
- Başlangıç/bitiş tarihleri
- Minimum alışveriş tutarı

#### Banner (Banner)
- Ana sayfa banner'ları
- Görsel ve video desteği
- Link URL desteği
- Sıralama (position)

#### StaticPage (Statik Sayfa)
- Dinamik statik sayfalar (KVKK, İade, vb.)
- Rich text içerik desteği
- Sayfaya özel görsel desteği
- Slug bazlı URL

#### SiteSettings (Site Ayarları)
- Site geneli ayarlar
- Renk ayarları (primary, secondary)
- Logo yolları
- WhatsApp numarası
- Header marquee metni
- Video background URL
- Footer metinleri
- SEO varsayılanları

#### Asset (Varlık)
- Yüklenen görsel ve videoların kaydı
- Organizasyon için kategori desteği

## 🎨 Özellikler

### Müşteri Tarafı Özellikleri

#### Ana Sayfa
- **Hero Section**: Animasyonlu arka plan, parçacık efektleri, CTA butonları
- **Banner Slider**: Otomatik kaydırma, görsel/video desteği, navigasyon okları
- **Öne Çıkan Ürünler**: Yatay kaydırılabilir ürün gösterimi
- **İstatistikler**: Kargo, güvenlik, kalite göstergeleri
- **Özellikler**: Hizmet özellikleri showcase
- **Video Background Section**: "Ürünlerimizi Canlı Görün" bölümü
- **Sosyal Kanıt**: Müşteri yorumları ve referanslar
- **Newsletter**: E-posta abonelik formu

#### Ürün Yönetimi
- Ürün listeleme ve filtreleme
- Kategori bazlı ürün görüntüleme
- Ürün detay sayfası:
  - Çoklu görsel/video galeri
  - Fiyat hesaplama (kampanya indirimleri dahil)
  - Özelleştirilebilir ürün seçenekleri
  - Sepete ekleme
  - İlgili ürünler
- Ürün arama:
  - Gerçek zamanlı autocomplete
  - Ürün adı, açıklama ve kategori bazlı arama
  - Arama sonuçları sayfası

#### Sepet ve Ödeme
- Sepet yönetimi (ekleme, çıkarma, miktar güncelleme)
- Otomatik kampanya indirimi uygulama
- PayTR ödeme entegrasyonu
- Sipariş takibi

#### Kampanyalar
- Kampanya listeleme
- Kampanya detay sayfası
- Otomatik indirim uygulama
- Paket kampanyaları

#### Kullanıcı Özellikleri
- Kullanıcı kaydı ve girişi
- Profil yönetimi
- Sipariş geçmişi
- Kargo takip

### Admin Panel Özellikleri

#### Dashboard
- Genel istatistikler
- Son siparişler
- Hızlı erişim menüleri

#### Ürün Yönetimi
- Ürün ekleme/düzenleme/silme
- Çoklu görsel ve video yükleme
- PC'den dosya yükleme veya manuel URL
- Ana görsel seçimi
- Görsel önizleme
- Ürün listesi (arama, filtreleme)
- Stok yönetimi
- Özelleştirilebilir ürün seçenekleri

#### Kategori Yönetimi
- Kategori ekleme/düzenleme/silme
- Kategori görseli
- Aktif/pasif durumu

#### Kampanya Yönetimi
- 4 farklı kampanya tipi:
  - **GENERAL**: Minimum alışveriş tutarına göre otomatik indirim
  - **CATEGORY**: Belirli kategorilere özel indirim
  - **PRODUCT**: Belirli ürünlere özel indirim
  - **PACKAGE**: Paket kampanyası (sabit fiyat, çoklu ürün seçimi)
- Yüzde veya sabit tutar indirimi
- Başlangıç/bitiş tarihleri
- Minimum alışveriş tutarı
- Paket görseli yükleme
- Kampanya detay sayfası

#### Banner Yönetimi
- Banner ekleme/düzenleme/silme
- Görsel ve video desteği
- PC'den dosya yükleme
- Link URL ayarlama
- Sıralama (position)
- Aktif/pasif durumu

#### Statik Sayfa Yönetimi
- Statik sayfa ekleme/düzenleme/silme
- Rich text editor (React Quill)
- HTML içerik desteği
- Sayfaya özel görsel yükleme
- Slug bazlı URL
- Footer'a otomatik ekleme

#### Site Ayarları
- Renk ayarları (primary, secondary)
- Logo yükleme (header, footer)
- WhatsApp numarası
- Header marquee metni
- Video background URL (Ürünlerimizi Canlı Görün bölümü için)
- Footer metinleri
- SEO varsayılanları

#### Sipariş Yönetimi
- Sipariş listeleme
- Sipariş detay görüntüleme
- Sipariş durumu güncelleme
- Kargo takip kodu ekleme
- Sipariş filtreleme

#### Kullanıcı Yönetimi
- Kullanıcı listeleme
- Rol yönetimi (CUSTOMER, ADMIN)

## 🔐 Kimlik Doğrulama

- **NextAuth.js** ile JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (ADMIN, CUSTOMER)
- Güvenli şifre hash'leme (bcryptjs)
- Session yönetimi
- Admin panel koruması

## 💳 Ödeme Entegrasyonu

### PayTR
- PayTR ödeme gateway entegrasyonu
- Test ve production modları
- Callback işleme
- Sipariş durumu güncelleme
- Kampanya indirimi desteği

## 🔍 Arama Özellikleri

- Gerçek zamanlı autocomplete
- 300ms debounce ile performans optimizasyonu
- Ürün adı, açıklama ve kategori bazlı arama
- Arama sonuçları sayfası
- Dropdown'da ürün önizleme (görsel, fiyat, kategori)

## 📱 Responsive Tasarım

- Mobil-first yaklaşım
- Tablet ve desktop optimizasyonu
- Touch-friendly arayüz
- Responsive grid sistemleri

## 🎨 UI/UX Özellikleri

- Modern ve profesyonel tasarım
- Animasyonlar ve geçiş efektleri:
  - Fade in/out
  - Slide animations
  - Scale animations
  - Gradient animations
  - Parallax scrolling
- Glassmorphism efektleri
- Hover efektleri
- Loading states (skeleton loaders)
- Toast bildirimleri
- Breadcrumb navigasyon

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+ 
- PostgreSQL database
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone [repository-url]
cd zensticker-ecommerce
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
`.env` dosyası oluşturun:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zensticker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# PayTR
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"
PAYTR_TEST_MODE="1" # 1 for test, 0 for production
```

4. **Veritabanını hazırlayın**
```bash
# Prisma client'ı generate edin
npm run db:generate

# Veritabanı şemasını oluşturun
npm run db:push

# (Opsiyonel) Seed data yükleyin
npm run db:seed
```

5. **Development server'ı başlatın**
```bash
npm run dev
```

6. **Tarayıcıda açın**
```
http://localhost:3000
```

## 📝 Scripts

- `npm run dev` - Development server başlat
- `npm run build` - Production build oluştur
- `npm run start` - Production server başlat
- `npm run lint` - ESLint çalıştır
- `npm run db:generate` - Prisma client generate et
- `npm run db:push` - Veritabanı şemasını push et
- `npm run db:migrate` - Migration oluştur ve uygula
- `npm run db:seed` - Seed data yükle
- `npm run db:studio` - Prisma Studio aç

## 🔌 API Endpoints

### Public API
- `GET /api/categories` - Aktif kategorileri getir
- `GET /api/search?q=...` - Ürün arama
- `GET /api/site-settings` - Site ayarlarını getir
- `GET /api/campaigns/check` - Uygulanabilir kampanyaları kontrol et
- `GET /api/kargo-takip?q=...` - Sipariş takibi

### Admin API
- `POST /api/admin/upload` - Dosya yükleme (görsel/video)
- `GET /api/admin/products` - Ürün listesi
- `POST /api/admin/products` - Yeni ürün oluştur
- `PATCH /api/admin/products/[id]` - Ürün güncelle
- `DELETE /api/admin/products/[id]` - Ürün sil
- `GET /api/admin/categories` - Kategori listesi
- `POST /api/admin/categories` - Yeni kategori oluştur
- `PATCH /api/admin/categories/[id]` - Kategori güncelle
- `DELETE /api/admin/categories/[id]` - Kategori sil
- `GET /api/admin/campaigns` - Kampanya listesi
- `POST /api/admin/campaigns` - Yeni kampanya oluştur
- `PATCH /api/admin/campaigns/[id]` - Kampanya güncelle
- `DELETE /api/admin/campaigns/[id]` - Kampanya sil
- `GET /api/admin/banners` - Banner listesi
- `POST /api/admin/banners` - Yeni banner oluştur
- `PATCH /api/admin/banners/[id]` - Banner güncelle
- `DELETE /api/admin/banners/[id]` - Banner sil
- `GET /api/admin/static-pages` - Statik sayfa listesi
- `POST /api/admin/static-pages` - Yeni statik sayfa oluştur
- `PATCH /api/admin/static-pages/[id]` - Statik sayfa güncelle
- `DELETE /api/admin/static-pages/[id]` - Statik sayfa sil
- `GET /api/admin/orders` - Sipariş listesi
- `PATCH /api/admin/orders/[id]` - Sipariş durumu güncelle
- `GET /api/admin/site-settings` - Site ayarlarını getir
- `PATCH /api/admin/site-settings` - Site ayarlarını güncelle

### Authentication API
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Payment API
- `POST /api/paytr/init` - PayTR ödeme başlat
- `POST /api/paytr/callback` - PayTR callback işleme

## 🎯 Kullanım Senaryoları

### Admin Kullanıcı İşlemleri

1. **Ürün Ekleme**
   - Admin panel → Ürünler → Yeni Ürün
   - Ürün bilgilerini doldur
   - Görselleri/videoları yükle (PC'den veya URL)
   - Ana görseli seç
   - Kategori seç
   - Fiyat ve stok bilgilerini gir
   - Kaydet

2. **Kampanya Oluşturma**
   - Admin panel → Kampanyalar → Yeni Kampanya
   - Kampanya tipini seç (GENERAL, CATEGORY, PRODUCT, PACKAGE)
   - İndirim tipini seç (yüzde veya sabit tutar)
   - Başlangıç/bitiş tarihlerini ayarla
   - İlgili ürünleri/kategorileri seç
   - Paket kampanyası için paket görseli yükle
   - Kaydet

3. **Banner Yönetimi**
   - Admin panel → Banner → Yeni Banner
   - Görsel veya video yükle
   - Link URL ekle (opsiyonel)
   - Sıralama (position) ayarla
   - Kaydet

4. **Site Ayarları**
   - Admin panel → Site Ayarları
   - Renkleri değiştir
   - Logoları yükle
   - WhatsApp numarasını güncelle
   - Header marquee metnini değiştir
   - Video background URL ekle
   - Kaydet

### Müşteri İşlemleri

1. **Ürün Arama**
   - Header'daki arama ikonuna tıkla
   - Ürün adı yaz (en az 2 karakter)
   - Autocomplete sonuçlarını gör
   - Ürüne tıkla veya "Tüm sonuçları gör" linkine tıkla

2. **Sepete Ekleme**
   - Ürün detay sayfasında miktar seç
   - Özelleştirilebilir ürünler için özel metin gir
   - "Sepete Ekle" butonuna tıkla

3. **Ödeme**
   - Sepet sayfasında siparişi gözden geçir
   - Otomatik kampanya indirimi uygulanır
   - Ödeme sayfasına git
   - Müşteri bilgilerini doldur
   - PayTR ile ödeme yap

4. **Sipariş Takibi**
   - Profil → Siparişlerim veya Kargo Takip
   - Sipariş numarası veya kargo takip kodu ile ara

## 🧪 Test

TestSprite framework'ü ile otomatik testler yapılabilir:
```bash
npm run test:testsprite
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Production ortamında aşağıdaki değişkenlerin ayarlanması gerekir:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `PAYTR_MERCHANT_ID`
- `PAYTR_MERCHANT_KEY`
- `PAYTR_MERCHANT_SALT`
- `PAYTR_TEST_MODE` (0 for production)

## 🔒 Güvenlik

- Şifreler bcryptjs ile hash'lenir
- NextAuth.js ile güvenli session yönetimi
- Admin panel rol bazlı korunur
- API endpoint'leri admin kontrolü ile korunur
- SQL injection koruması (Prisma ORM)
- XSS koruması (React'in built-in koruması)

## 📈 Performans

- Next.js 14 App Router ile optimizasyon
- Image optimization (Next.js Image component)
- Server-side rendering (SSR)
- Static generation (SSG) where applicable
- Code splitting
- Lazy loading

## 🐛 Bilinen Sorunlar ve Limitler

- Video yükleme limiti: 50MB
- Görsel yükleme limiti: 10MB
- Arama minimum karakter: 2
- Autocomplete sonuç limiti: 5

## 🔮 Gelecek Geliştirmeler

- Çoklu dil desteği (i18n)
- Email bildirimleri
- SMS bildirimleri
- Gelişmiş analitik
- Ürün yorumları ve puanlama
- Favori ürünler
- Karşılaştırma özelliği
- Gelişmiş filtreleme
- Sipariş iptal/iptal iade
- Kupon sistemi
- Toplu ürün yükleme (Excel import)
- API dokümantasyonu (Swagger/OpenAPI)

## 📞 Destek

Sorularınız için:
- GitHub Issues
- Email: [support-email]

## 📄 Lisans

[Lisans bilgisi]

## 👥 Katkıda Bulunanlar

[Katkıda bulunanlar listesi]

---

**Not**: Bu README dosyası projenin mevcut durumunu yansıtmaktadır. Geliştirmeler devam ettikçe güncellenecektir.
