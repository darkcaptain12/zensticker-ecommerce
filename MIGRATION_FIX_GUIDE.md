# Migration Fix Guide - Kupon Alanları

## Yapılan Düzeltmeler

### 1. ✅ Eski Migration Düzeltildi
- `prisma/migrations/add_campaign_code/migration.sql` dosyası güncellendi
- `IF NOT EXISTS` eklendi (campaignCode kolonu tekrar eklenmeye çalışıldığında hata vermeyecek)

### 2. ✅ Schema Kontrolü
- `prisma/schema.prisma` - Campaign modelinde kupon alanları zaten mevcut:
  - `isCoupon Boolean @default(false)`
  - `couponCode String? @unique`
  - `appliesTo CampaignScope @default(ALL_PRODUCTS)`
  - `campaignCode String? @unique` (zaten var)
- `CampaignScope` enum mevcut: `ALL_PRODUCTS`, `SELECTED_PRODUCTS`

### 3. ✅ API Route'ları
- `app/api/admin/campaigns/route.ts` - Kupon alanları zaten kullanılıyor ✅
- `app/api/admin/campaigns/[id]/route.ts` - Kupon alanları zaten kullanılıyor ✅

### 4. ✅ Migration Template Hazırlandı
- `prisma/migrations/ADD_COUPON_FIELDS_TEMPLATE.sql` dosyası oluşturuldu

## Çalıştırılacak Komutlar

### Adım 1: Kupon alanları için migration oluştur

```bash
npx prisma migrate dev --create-only --name add_coupon_fields
```

Bu komut yeni bir migration klasörü oluşturacak (örn: `20250101120000_add_coupon_fields/`)

### Adım 2: Migration SQL içeriğini değiştir

Oluşturulan migration klasöründeki `migration.sql` dosyasının içeriğini sil ve şununla değiştir:

```sql
-- AlterTable: Add coupon fields
ALTER TABLE "campaigns"
  ADD COLUMN IF NOT EXISTS "isCoupon" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "couponCode" TEXT,
  ADD COLUMN IF NOT EXISTS "appliesTo" TEXT NOT NULL DEFAULT 'ALL_PRODUCTS';

-- CreateIndex: Unique constraint for couponCode
CREATE UNIQUE INDEX IF NOT EXISTS "campaigns_couponCode_key" 
  ON "campaigns"("couponCode") 
  WHERE "couponCode" IS NOT NULL;
```

**Veya** template dosyasını kopyala:
```bash
cp prisma/migrations/ADD_COUPON_FIELDS_TEMPLATE.sql prisma/migrations/[YENI_MIGRATION_KLASORU]/migration.sql
```

### Adım 3: Migration'ı uygula

```bash
npx prisma migrate dev
```

### Adım 4: Prisma Client'ı yeniden oluştur

```bash
npx prisma generate
```

## ⚠️ ÖNEMLİ NOTLAR

1. **VERİTABANI SIFIRLAMA YOK**: Hiçbir adımda `prisma migrate reset`, `DROP TABLE`, `TRUNCATE` vb. komutlar kullanılmadı.

2. **Mevcut Veriler Korundu**: Tüm migration'lar `IF NOT EXISTS` ile güvenli hale getirildi.

3. **Eski Migration Düzeltildi**: `add_campaign_code/migration.sql` artık `IF NOT EXISTS` kullanıyor, tekrar çalıştırılabilir.

4. **Schema Zaten Hazır**: Schema'da tüm kupon alanları zaten tanımlı, sadece veritabanına migration yapılması gerekiyor.

## Kontrol Listesi

- [x] Schema'da kupon alanları var
- [x] Eski migration düzeltildi (IF NOT EXISTS eklendi)
- [x] Migration template hazırlandı
- [x] API route'ları doğru
- [ ] Migration oluşturuldu (siz yapacaksınız)
- [ ] Migration uygulandı (siz yapacaksınız)
- [ ] Prisma client yenilendi (siz yapacaksınız)

## Sorun Giderme

### Hata: "campaignCode already exists"
✅ **Çözüldü**: Eski migration'a `IF NOT EXISTS` eklendi.

### Hata: "Unknown argument 'isCoupon'"
✅ **Çözülecek**: Migration uygulandıktan ve `npx prisma generate` çalıştırıldıktan sonra düzelecek.

### Hata: Migration çalışmıyor
- Migration SQL dosyasının içeriğini kontrol edin
- `IF NOT EXISTS` kullanıldığından emin olun
- PostgreSQL syntax'ına uygun olduğundan emin olun

