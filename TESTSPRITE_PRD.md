 # TestSprite PRD (Product Requirements Document)
## Zen Sticker E-Commerce Platform

### 1. Genel Bakış

Bu PRD, Zen Sticker e-ticaret platformu için TestSprite test framework'ü ile yapılacak kapsamlı test senaryolarını tanımlar. Testler hem public storefront hem de admin paneli için yapılacaktır.

### 2. Proje Bilgileri

- **Proje Adı**: Zen Sticker E-Commerce
- **Framework**: Next.js 14 (App Router)
- **Test Framework**: TestSprite
- **Test Tipi**: Frontend (E2E)
- **Test Modu**: PayTR Test Mode (Gerçek ödeme yapılmayacak)

### 3. Test Kapsamı

#### 3.1 Public Storefront Testleri

##### 3.1.1 Ana Sayfa (`/`)
- [ ] Hero banner slider'ın çalıştığını kontrol et
- [ ] Banner geçişlerinin (oklar ile) çalıştığını doğrula
- [ ] Banner'ların responsive olduğunu ve kesilmediğini kontrol et
- [ ] Kategoriler bölümünün görüntülendiğini doğrula
- [ ] Öne çıkan ürünlerin listelendiğini kontrol et
- [ ] Ürün kartlarında kampanya rozetlerinin göründüğünü doğrula
- [ ] Header'da kayar yazının (marquee) çalıştığını kontrol et
- [ ] WhatsApp butonunun göründüğünü ve çalıştığını doğrula
- [ ] Footer'ın tüm linklerinin çalıştığını kontrol et

##### 3.1.2 Kategoriler Sayfası (`/kategoriler`)
- [ ] Tüm aktif kategorilerin listelendiğini doğrula
- [ ] Kategori kartlarına tıklandığında kategori detay sayfasına yönlendirdiğini kontrol et
- [ ] Responsive tasarımın çalıştığını doğrula

##### 3.1.3 Kategori Detay Sayfası (`/kategori/[slug]`)
- [ ] Kategori bilgilerinin doğru görüntülendiğini kontrol et
- [ ] Kategoriye ait ürünlerin listelendiğini doğrula
- [ ] Ürün sıralama seçeneklerinin çalıştığını kontrol et (Yeni, Fiyat Artan, Fiyat Azalan)
- [ ] Ürün kartlarına tıklandığında ürün detay sayfasına yönlendirdiğini doğrula
- [ ] Kampanya indirimlerinin ürün fiyatlarında doğru hesaplandığını kontrol et

##### 3.1.4 Kampanyalar Sayfası (`/kampanyalar`)
- [ ] Aktif kampanyaların listelendiğini doğrula
- [ ] Paket kampanyalarının görsel ve fiyat bilgilerinin doğru görüntülendiğini kontrol et
- [ ] Kampanya kartlarında indirim bilgilerinin doğru gösterildiğini doğrula
- [ ] Kampanya tarihlerinin doğru görüntülendiğini kontrol et

##### 3.1.5 Ürün Detay Sayfası (`/urun/[slug]`)
- [ ] Ürün bilgilerinin doğru görüntülendiğini kontrol et
- [ ] Ürün görsellerinin/videolarının görüntülendiğini doğrula
- [ ] Görsel galerisinin çalıştığını kontrol et
- [ ] Fiyat bilgilerinin doğru gösterildiğini doğrula
- [ ] Kampanya indirimlerinin doğru hesaplandığını kontrol et
- [ ] Stok durumunun gösterildiğini doğrula
- [ ] Kişiye özel sticker seçeneklerinin göründüğünü kontrol et (eğer ürün customizable ise)
- [ ] Font seçimi dropdown'ının çalıştığını doğrula
- [ ] Canlı önizlemenin çalıştığını kontrol et
- [ ] Karakter sayacının çalıştığını doğrula
- [ ] Adet seçicisinin çalıştığını kontrol et
- [ ] "Sepete Ekle" butonunun çalıştığını doğrula
- [ ] "Hemen Satın Al" butonunun çalıştığını kontrol et
- [ ] Ürün açıklamasının görüntülendiğini doğrula
- [ ] Teslimat & İade bilgilerinin göründüğünü kontrol et

##### 3.1.6 Sepet Sayfası (`/sepet`)
- [ ] Sepete eklenen ürünlerin listelendiğini doğrula
- [ ] Ürün miktarının değiştirilebildiğini kontrol et
- [ ] Ürün silme işleminin çalıştığını doğrula
- [ ] Toplam fiyatın doğru hesaplandığını kontrol et
- [ ] Kampanya indirimlerinin sepette doğru uygulandığını doğrula
- [ ] "Ödemeye Geç" butonunun çalıştığını kontrol et
- [ ] Boş sepet durumunun doğru gösterildiğini doğrula

##### 3.1.7 Ödeme Sayfası (`/odeme`)
- [ ] Müşteri bilgileri formunun göründüğünü kontrol et
- [ ] Form validasyonunun çalıştığını doğrula
- [ ] Adres bilgilerinin alındığını kontrol et
- [ ] Sipariş özetinin doğru gösterildiğini doğrula
- [ ] PayTR ödeme formunun yüklendiğini kontrol et
- [ ] **PayTR TEST MODE** olduğunu doğrula (gerçek ödeme yapılmamalı)

##### 3.1.8 PayTR Ödeme Sayfası (`/odeme/paytr`)
- [ ] PayTR formunun yüklendiğini kontrol et
- [ ] **TEST MODE** olduğunu doğrula
- [ ] Test kartı bilgileri ile ödeme yapılabildiğini kontrol et
- [ ] Başarılı ödeme sonrası yönlendirmenin çalıştığını doğrula
- [ ] Başarısız ödeme durumunun doğru işlendiğini kontrol et

##### 3.1.9 Sipariş Teşekkür Sayfası (`/siparis-tesekkur/[orderNumber]`)
- [ ] Sipariş numarasının gösterildiğini doğrula
- [ ] Sipariş detaylarının doğru görüntülendiğini kontrol et
- [ ] Sipariş özetinin doğru gösterildiğini doğrula

##### 3.1.10 Kargo Takip Sayfası (`/kargo-takip`)
- [ ] Giriş yapmış kullanıcı için otomatik sipariş listesinin göründüğünü kontrol et
- [ ] Misafir kullanıcı için arama formunun göründüğünü doğrula
- [ ] Sipariş numarası ile arama yapılabildiğini kontrol et
- [ ] Kargo takip koduna tıklandığında kargo firması sayfasına yönlendirdiğini doğrula

##### 3.1.11 Kullanıcı Girişi (`/giris`)
- [ ] Giriş formunun göründüğünü kontrol et
- [ ] Email ve şifre validasyonunun çalıştığını doğrula
- [ ] Başarılı giriş sonrası yönlendirmenin çalıştığını kontrol et
- [ ] Hatalı giriş durumunda hata mesajının gösterildiğini doğrula

##### 3.1.12 Kullanıcı Kaydı (`/kayit`)
- [ ] Kayıt formunun göründüğünü kontrol et
- [ ] Form validasyonunun çalıştığını doğrula
- [ ] Başarılı kayıt sonrası yönlendirmenin çalıştığını kontrol et

##### 3.1.13 Profil Sayfası (`/profil`)
- [ ] Kullanıcı bilgilerinin görüntülendiğini kontrol et
- [ ] Profil güncelleme formunun çalıştığını doğrula
- [ ] Sipariş geçmişinin listelendiğini kontrol et

##### 3.1.14 Statik Sayfalar
- [ ] Hakkımızda sayfasının (`/hakkimizda`) görüntülendiğini kontrol et
- [ ] İletişim sayfasının (`/iletisim`) görüntülendiğini doğrula
- [ ] Diğer statik sayfaların (SSS, KVKK, vb.) görüntülendiğini kontrol et
- [ ] Footer'dan statik sayfalara linklerin çalıştığını doğrula

#### 3.2 Admin Panel Testleri

**Not**: Admin paneli testleri için login gereklidir. Test kullanıcısı:
- Email: `admin@zensticker.com`
- Şifre: `Admin123!`

##### 3.2.1 Admin Girişi (`/admin`)
- [ ] Admin giriş sayfasının göründüğünü kontrol et
- [ ] Admin kullanıcı ile giriş yapılabildiğini doğrula
- [ ] Giriş sonrası admin dashboard'una yönlendirdiğini kontrol et

##### 3.2.2 Admin Dashboard (`/admin`)
- [ ] Dashboard'un yüklendiğini kontrol et
- [ ] İstatistiklerin görüntülendiğini doğrula
- [ ] Sidebar menüsünün göründüğünü kontrol et

##### 3.2.3 Ürün Yönetimi (`/admin/urunler`)
- [ ] Ürün listesinin görüntülendiğini kontrol et
- [ ] "Yeni Ürün" butonunun çalıştığını doğrula
- [ ] Ürün arama/filtreleme özelliğinin çalıştığını kontrol et
- [ ] Ürün düzenleme sayfasına gidilebildiğini doğrula
- [ ] Ürün silme işleminin çalıştığını kontrol et

##### 3.2.4 Yeni Ürün Ekleme (`/admin/urunler/yeni`)
- [ ] Ürün formunun göründüğünü kontrol et
- [ ] Tüm form alanlarının doldurulabildiğini doğrula
- [ ] Kategori seçiminin çalıştığını kontrol et
- [ ] Kampanya seçiminin çalıştığını doğrula
- [ ] Görsel ekleme özelliğinin çalıştığını kontrol et:
  - [ ] "Mevcut Görsellerden Seç" seçeneğinin çalıştığını doğrula
  - [ ] "Kayıtlı Görsellerden Seç" seçeneğinin çalıştığını kontrol et
  - [ ] "Manuel URL Gir" seçeneğinin çalıştığını doğrula
  - [ ] Görsel önizlemesinin göründüğünü kontrol et
  - [ ] Video ekleme özelliğinin çalıştığını doğrula
- [ ] Ana görsel seçiminin çalıştığını kontrol et
- [ ] Ürün kaydetme işleminin çalıştığını doğrula

##### 3.2.5 Ürün Düzenleme (`/admin/urunler/[id]`)
- [ ] Mevcut ürün bilgilerinin yüklendiğini kontrol et
- [ ] Görsellerin görüntülendiğini doğrula
- [ ] Görsel ekleme/çıkarma işlemlerinin çalıştığını kontrol et
- [ ] Ürün güncelleme işleminin çalıştığını doğrula

##### 3.2.6 Kategori Yönetimi (`/admin/kategoriler`)
- [ ] Kategori listesinin görüntülendiğini kontrol et
- [ ] "Yeni Kategori" butonunun çalıştığını doğrula
- [ ] Kategori ekleme formunun çalıştığını kontrol et
- [ ] Kategori düzenleme işleminin çalıştığını doğrula
- [ ] Kategori silme işleminin çalıştığını kontrol et

##### 3.2.7 Kampanya Yönetimi (`/admin/kampanyalar`)
- [ ] Kampanya listesinin görüntülendiğini kontrol et
- [ ] "Yeni Kampanya" butonunun çalıştığını doğrula
- [ ] Kampanya ekleme formunun çalıştığını kontrol et
- [ ] Kampanya tiplerinin seçilebildiğini doğrula:
  - [ ] Genel kampanya
  - [ ] Kategori kampanyası
  - [ ] Ürün kampanyası
  - [ ] Paket kampanyası
- [ ] Paket kampanyası için:
  - [ ] Paket ürünlerinin eklenebildiğini kontrol et
  - [ ] Paket fiyatının belirlenebildiğini doğrula
  - [ ] Paket görselinin eklenebildiğini kontrol et
- [ ] Kampanya düzenleme işleminin çalıştığını doğrula
- [ ] Kampanya silme işleminin çalıştığını kontrol et

##### 3.2.8 Banner Yönetimi (`/admin/banner`)
- [ ] Banner listesinin görüntülendiğini kontrol et
- [ ] "Yeni Banner" butonunun çalıştığını doğrula
- [ ] Banner ekleme formunun çalıştığını kontrol et:
  - [ ] Görsel seçiminin çalıştığını doğrula
  - [ ] Banner pozisyonunun ayarlanabildiğini kontrol et
  - [ ] Link URL'inin girilebildiğini doğrula
- [ ] Banner düzenleme işleminin çalıştığını doğrula
- [ ] Banner silme işleminin çalıştığını kontrol et
- [ ] Banner sıralamasının değiştirilebildiğini doğrula

##### 3.2.9 Site Ayarları (`/admin/site-ayarlari`)
- [ ] Site ayarları formunun göründüğünü kontrol et
- [ ] Renk ayarlarının değiştirilebildiğini doğrula:
  - [ ] Primary color değişikliğinin siteye yansıdığını kontrol et
  - [ ] Secondary color değişikliğinin siteye yansıdığını doğrula
- [ ] Logo yükleme özelliğinin çalıştığını kontrol et
- [ ] WhatsApp numarasının ayarlanabildiğini doğrula
- [ ] Header marquee text'inin ayarlanabildiğini kontrol et
- [ ] Footer linklerinin ayarlanabildiğini doğrula
- [ ] Ayarların kaydedildiğini ve siteye yansıdığını doğrula

##### 3.2.10 Statik Sayfa Yönetimi (`/admin/static-pages`)
- [ ] Statik sayfa listesinin görüntülendiğini kontrol et
- [ ] "Yeni Sayfa" butonunun çalıştığını doğrula
- [ ] Statik sayfa ekleme formunun çalıştığını kontrol et
- [ ] İçerik editörünün çalıştığını doğrula
- [ ] Statik sayfa düzenleme işleminin çalıştığını doğrula
- [ ] Statik sayfa silme işleminin çalıştığını kontrol et
- [ ] Yeni eklenen sayfanın footer'a eklendiğini doğrula

##### 3.2.11 Sipariş Yönetimi (`/admin/siparisler`)
- [ ] Sipariş listesinin görüntülendiğini kontrol et
- [ ] Sipariş detaylarının görüntülendiğini doğrula
- [ ] Sipariş durumu güncelleme işleminin çalıştığını kontrol et
- [ ] Kargo takip kodu ekleme işleminin çalıştığını doğrula

##### 3.2.12 Kullanıcı Yönetimi (`/admin/kullanicilar`)
- [ ] Kullanıcı listesinin görüntülendiğini kontrol et
- [ ] Kullanıcı detaylarının görüntülendiğini doğrula

### 4. Özel Test Senaryoları

#### 4.1 PayTR Test Mode
- [ ] **PayTR TEST MODE** aktif olduğunu doğrula
- [ ] Test kartı bilgileri ile ödeme yapılabildiğini kontrol et
- [ ] Gerçek ödeme yapılmadığını doğrula
- [ ] Test ödeme sonrası sipariş durumunun doğru güncellendiğini kontrol et

#### 4.2 Responsive Tasarım
- [ ] Mobil görünümde tüm sayfaların düzgün görüntülendiğini kontrol et
- [ ] Tablet görünümde tüm sayfaların düzgün görüntülendiğini doğrula
- [ ] Desktop görünümde tüm sayfaların düzgün görüntülendiğini kontrol et
- [ ] Banner'ların tüm ekran boyutlarında kesilmediğini doğrula

#### 4.3 SEO ve Performans
- [ ] Meta tag'lerin doğru ayarlandığını kontrol et
- [ ] JSON-LD schema'larının doğru oluşturulduğunu doğrula
- [ ] Sitemap'in erişilebilir olduğunu kontrol et
- [ ] Robots.txt'in doğru yapılandırıldığını doğrula

#### 4.4 Form Validasyonları
- [ ] Tüm formlarda zorunlu alan validasyonunun çalıştığını kontrol et
- [ ] Email format validasyonunun çalıştığını doğrula
- [ ] Telefon numarası validasyonunun çalıştığını kontrol et
- [ ] Şifre validasyonunun çalıştığını doğrula

#### 4.5 Kampanya Hesaplamaları
- [ ] Yüzde indirim hesaplamasının doğru yapıldığını kontrol et
- [ ] Sabit tutar indirimi hesaplamasının doğru yapıldığını doğrula
- [ ] Paket kampanyası fiyatının doğru gösterildiğini kontrol et
- [ ] Minimum alışveriş tutarı kontrolünün çalıştığını doğrula

### 5. Test Ortamı

- **Base URL**: `http://localhost:3001` (site 3001 portunda çalışıyor)
- **Test Kullanıcısı (Admin)**: 
  - Email: `admin@zensticker.com`
  - Şifre: `Admin123!`
- **PayTR Test Mode**: Aktif
- **Database**: Test veritabanı (seed edilmiş)

### 6. Test Öncelikleri

#### Yüksek Öncelik
1. Ana sayfa ve navigasyon
2. Ürün görüntüleme ve sepete ekleme
3. Ödeme akışı (PayTR test mode)
4. Admin paneli temel işlevler

#### Orta Öncelik
1. Kampanya hesaplamaları
2. Kullanıcı kayıt/giriş
3. Kargo takip
4. Admin paneli gelişmiş özellikler

#### Düşük Öncelik
1. Statik sayfalar
2. SEO optimizasyonları
3. Performans metrikleri

### 7. Beklenen Sonuçlar

- Tüm test senaryoları başarıyla geçmeli
- Hiçbir kritik hata olmamalı
- PayTR test mode aktif olmalı ve gerçek ödeme yapılmamalı
- Tüm sayfalar responsive olmalı
- Admin paneli tüm CRUD işlemlerini desteklemeli
- Form validasyonları çalışmalı
- Kampanya hesaplamaları doğru olmalı

### 8. Notlar

- TestSprite, Next.js development server'ının çalışıyor olmasını bekler
- Testler çalıştırılmadan önce `npm run dev` komutu ile server başlatılmalı
- Database seed edilmiş olmalı
- Test kullanıcısı oluşturulmuş olmalı
- PayTR test mode aktif olmalı

### 9. Test Raporu

TestSprite testleri tamamlandıktan sonra:
- Test sonuçları markdown formatında kaydedilecek
- Screenshot'lar `testsprite-screenshots/` klasörüne kaydedilecek
- Hata durumları detaylı loglanacak
- Test coverage raporu oluşturulacak

---

**Son Güncelleme**: 2025-01-XX
**Versiyon**: 1.0
**Durum**: Aktif

