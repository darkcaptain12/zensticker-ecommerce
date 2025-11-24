# TestSprite Configuration

Bu proje için TestSprite test framework'ü yapılandırılmıştır.

## Kurulum

TestSprite'ı kullanmak için önce gerekli paketleri yükleyin:

```bash
npm install --save-dev testsprite
```

## Konfigürasyon

Ana konfigürasyon dosyası `testsprite.config.js` içinde bulunmaktadır.

### Önemli Ayarlar

- **type**: `frontend` - Next.js frontend uygulaması
- **localPort**: `3001` - Next.js development server portu (site 3001'de çalışıyor)
- **testScope**: `codebase` - Tüm codebase'i test et
- **needLogin**: `false` - Testler için login gerekmiyor (admin paneli için `true` yapılabilir)

## Kullanım

### Test Planı Oluşturma

Frontend test planı oluşturmak için:

```bash
npm run test:testsprite:generate
```

### Testleri Çalıştırma

Testleri çalıştırmak için:

```bash
npm run test:testsprite
```

## Test Edilecek Sayfalar

Aşağıdaki sayfalar test kapsamına dahil edilmiştir:

- Ana Sayfa (`/`)
- Kategoriler (`/kategoriler`)
- Kampanyalar (`/kampanyalar`)
- Kargo Takip (`/kargo-takip`)
- İletişim (`/iletisim`)

## Hariç Tutulan Yollar

Aşağıdaki yollar test kapsamı dışındadır:

- `/api` - API endpoint'leri
- `/admin` - Admin paneli (ayrı test edilebilir)
- `/_next` - Next.js internal dosyaları
- `/static` - Static dosyalar

## Notlar

- TestSprite, Next.js development server'ının çalışıyor olmasını bekler
- Testler çalıştırılmadan önce `npm run dev` komutu ile server'ı başlatın
- Screenshot'lar `testsprite-screenshots/` klasörüne kaydedilir

