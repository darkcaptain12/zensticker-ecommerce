import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create default categories
  console.log('📁 Creating categories...')
  const categories = [
    { name: 'Araç Sticker', slug: 'arac-sticker', description: 'Araçlar için özel tasarım stickerlar' },
    { name: 'Kapı Direk Kaplama', slug: 'kapi-direk-kaplama', description: 'Kapı direk kaplama ürünleri' },
    { name: 'Kişiye Özel Sticker', slug: 'kisiye-ozel-sticker', description: 'Kişiye özel tasarlanabilir stickerlar' },
    { name: 'Araç Kaplama', slug: 'arac-kaplama', description: 'Araç kaplama ürünleri' },
    { name: 'Premium Sticker', slug: 'premium-sticker', description: 'Premium kalite stickerlar' },
    { name: 'Sticker Paketleri', slug: 'sticker-paketleri', description: 'Sticker paket seçenekleri' },
  ]

  const createdCategories: { [key: string]: string } = {}

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCategories[cat.name] = category.id
    console.log(`  ✓ Created category: ${cat.name}`)
  }

  // 2. Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@zensticker.com' },
    update: {},
    create: {
      email: 'admin@zensticker.com',
      name: 'Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('  ✓ Admin user created: admin@zensticker.com / Admin123!')

  // 3. Create site settings
  console.log('⚙️ Creating site settings...')
  await prisma.siteSettings.upsert({
    where: { id: '1' },
    update: {
      headerMarqueeText: '200₺ üzeri ücretsiz kargo',
    },
    create: {
      id: '1',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      headerLogoPath: '/logo/siyah_zensticker.png',
      footerLogoPath: '/logo/beyaz_zensticker.png',
      whatsappPhoneNumber: '+905551234567',
      headerMarqueeText: '200₺ üzeri ücretsiz kargo',
      footerTexts: {
        about: 'Zen Sticker - Araç sticker ve kaplama çözümleri',
        contact: 'info@zensticker.com',
      },
      seoMetaDefaults: {
        title: 'Zen Sticker - Premium Araç Sticker ve Kaplama',
        description: 'Kaliteli araç sticker, kapı direk kaplama ve kişiye özel sticker çözümleri.',
      },
    },
  })
  console.log('  ✓ Site settings created')

  // 4. Create default banners
  console.log('🖼️ Creating banners...')
  const banners = [
    { title: 'Banner 6', filePath: '/banner/banner6.png', position: 0 },
    { title: 'Banner 7', filePath: '/banner/banner7.png', position: 1 },
    { title: 'Banner 10', filePath: '/banner/banner10.png', position: 2 },
  ]

  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: banner.title },
      update: {},
      create: {
        id: banner.title,
        title: banner.title,
        type: 'IMAGE',
        filePath: banner.filePath,
        linkUrl: '/kategoriler',
        isActive: true,
        position: banner.position,
      },
    })
  }
  console.log('  ✓ Banners created')

  // 5. Read and import Excel file
  console.log('📊 Reading Excel file...')
  const excelPath = path.join(process.cwd(), 'Ürünleriniz_22.11.2025-22.22.xlsx')
  
  // Also try alternative path with Turkish characters
  const excelPathAlt = path.join(process.cwd(), 'Ürünleriniz_22.11.2025-22.22.xlsx')
  
  const actualExcelPath = fs.existsSync(excelPath) ? excelPath : (fs.existsSync(excelPathAlt) ? excelPathAlt : null)
  
  if (!actualExcelPath) {
    console.log('  ⚠️ Excel file not found, skipping product import')
    console.log('  📝 You can manually add products via admin panel')
  } else {
    const workbook = XLSX.readFile(actualExcelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as any[]

    console.log(`  ✓ Found ${data.length} rows in Excel`)

    // Map Excel columns (adjust based on actual Excel structure)
    // Assuming columns: Name, Category, Price, SalePrice, Stock, Description, Images
    for (const row of data) {
      try {
        const productName = row['Ürün Adı'] || row['Name'] || row['Ürün'] || ''
        const categoryName = row['Kategori'] || row['Category'] || 'Araç Sticker'
        const price = parseFloat(row['Fiyat'] || row['Price'] || '0') || 0
        const salePrice = row['İndirimli Fiyat'] || row['SalePrice'] ? parseFloat(row['İndirimli Fiyat'] || row['SalePrice'] || '0') : null
        const stock = parseInt(row['Stok'] || row['Stock'] || '0') || 0
        const description = row['Açıklama'] || row['Description'] || ''
        const imageFolder = row['Klasör'] || row['Folder'] || ''

        if (!productName) continue

        // Find or create category
        let categoryId = createdCategories[categoryName]
        if (!categoryId) {
          const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[çğıöşü]/g, (m: string) => {
            const map: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }
            return map[m] || m
          })
          const newCategory = await prisma.category.upsert({
            where: { slug },
            update: {},
            create: {
              name: categoryName,
              slug,
              description: '',
              isActive: true,
            },
          })
          categoryId = newCategory.id
          createdCategories[categoryName] = categoryId
        }

        // Create product slug
        const productSlug = productName
          .toLowerCase()
          .replace(/[çğıöşü]/g, (m: string) => {
            const map: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }
            return map[m] || m
          })
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { slug: productSlug },
        })

        if (existingProduct) {
          console.log(`  ⏭️ Skipping existing product: ${productName}`)
          continue
        }

        // Create product
        const isCustomizable = categoryName.includes('Kişiye Özel') || categoryName.includes('Özel')
        
        const product = await prisma.product.create({
          data: {
            name: productName,
            slug: productSlug,
            description: description || `${productName} ürünü`,
            price,
            salePrice: salePrice && salePrice > 0 ? salePrice : null,
            stock,
            categoryId,
            isActive: true,
            isCustomizable,
          },
        })

        // Add images if folder exists
        if (imageFolder) {
          // Try both Turkish and non-Turkish folder names
          const imageDir1 = path.join(process.cwd(), 'ürün_görselleri', imageFolder)
          const imageDir2 = path.join(process.cwd(), 'ürün_görselleri', imageFolder)
          const imageDir = fs.existsSync(imageDir1) ? imageDir1 : imageDir2
          if (fs.existsSync(imageDir)) {
            const files = fs.readdirSync(imageDir)
            const imageFiles = files.filter(f => 
              /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
            )

            for (let i = 0; i < imageFiles.length; i++) {
              const imageFile = imageFiles[i]
              await prisma.productImage.create({
                data: {
                  productId: product.id,
                  url: `/products/${imageFolder}/${imageFile}`,
                  altText: `${productName} - Görsel ${i + 1}`,
                  isMain: i === 0,
                },
              })
            }
          }
        }

        // Create custom sticker options for customizable products
        if (isCustomizable) {
          await prisma.customStickerOption.create({
            data: {
              productId: product.id,
              label: 'İsim Stickerı',
              availableFonts: [
                'Arial',
                'Helvetica',
                'Times New Roman',
                'Courier New',
                'Verdana',
                'Georgia',
                'Comic Sans MS',
                'Impact',
              ],
              maxCharacters: 50,
            },
          })
        }

        console.log(`  ✓ Created product: ${productName}`)
      } catch (error) {
        console.error(`  ✗ Error creating product from row:`, error)
      }
    }
  }

  // 6. Create default static pages
  console.log('📄 Creating static pages...')
  const staticPages = [
    {
      slug: 'hakkimizda',
      title: 'Hakkımızda',
      content: `
        <h2>Zen Sticker Hakkında</h2>
        <p>Zen Sticker olarak, araç sahiplerine en kaliteli sticker ve kaplama çözümlerini sunmak için yola çıktık. Yılların deneyimi ve profesyonel ekibimizle, araçlarınızı kişiselleştirmenin en iyi yolunu sunuyoruz.</p>
        <h3>Misyonumuz</h3>
        <p>Müşterilerimize en yüksek kalitede ürünler sunarak, araçlarını hayallerindeki gibi özelleştirmelerine yardımcı olmak.</p>
        <h3>Vizyonumuz</h3>
        <p>Türkiye'nin en güvenilir ve kaliteli araç sticker ve kaplama markası olmak.</p>
        <h3>Neden Zen Sticker?</h3>
        <ul>
          <li>Premium kalite ürünler</li>
          <li>Hızlı ve güvenli teslimat</li>
          <li>Uygun fiyat garantisi</li>
          <li>Müşteri memnuniyeti odaklı hizmet</li>
          <li>Geniş ürün yelpazesi</li>
        </ul>
      `,
    },
    {
      slug: 'iletisim',
      title: 'İletişim',
      content: `
        <h2>İletişim Bilgileri</h2>
        <p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p>
        <h3>E-posta</h3>
        <p><strong>Genel Bilgi:</strong> info@zensticker.com</p>
        <p><strong>Destek:</strong> destek@zensticker.com</p>
        <h3>Telefon</h3>
        <p><strong>Müşteri Hizmetleri:</strong> +90 (555) 123 45 67</p>
        <p>Çalışma Saatleri: Pazartesi - Cuma: 09:00 - 18:00</p>
        <h3>WhatsApp</h3>
        <p>WhatsApp üzerinden 7/24 destek alabilirsiniz. Sağ alt köşedeki WhatsApp butonuna tıklayarak bize ulaşabilirsiniz.</p>
        <h3>Adres</h3>
        <p>Zen Sticker E-Ticaret<br />
        İstanbul, Türkiye</p>
      `,
    },
    {
      slug: 'sss',
      title: 'Sık Sorulan Sorular',
      content: `
        <h2>Sık Sorulan Sorular</h2>
        <div class="space-y-6">
          <div>
            <h3>Siparişim ne zaman kargoya verilir?</h3>
            <p>Stokta bulunan ürünler için aynı gün kargo garantisi sunuyoruz. Saat 15:00'a kadar verilen siparişler aynı gün kargoya verilir.</p>
          </div>
          <div>
            <h3>Ücretsiz kargo var mı?</h3>
            <p>200₺ ve üzeri siparişlerde ücretsiz kargo hizmeti sunuyoruz.</p>
          </div>
          <div>
            <h3>Sticker'lar nasıl uygulanır?</h3>
            <p>Tüm sticker'larımız kolay uygulanabilir özelliktedir. Detaylı uygulama talimatları ürünle birlikte gönderilir.</p>
          </div>
          <div>
            <h3>İade yapabilir miyim?</h3>
            <p>14 gün içinde ücretsiz iade hakkınız bulunmaktadır. Ürün kullanılmamış ve orijinal ambalajında olmalıdır.</p>
          </div>
          <div>
            <h3>Özel tasarım yapılıyor mu?</h3>
            <p>Evet, kişiye özel sticker kategorisindeki ürünlerimizde özel tasarım yapılabilmektedir.</p>
          </div>
        </div>
      `,
    },
    {
      slug: 'kvkk-ve-gizlilik',
      title: 'KVKK ve Gizlilik Politikası',
      content: `
        <h2>Kişisel Verilerin Korunması</h2>
        <p>Zen Sticker olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin korunmasına büyük önem vermekteyiz.</p>
        <h3>Veri Sorumlusu</h3>
        <p>Zen Sticker, kişisel verilerinizin işlenmesinde veri sorumlusu sıfatına sahiptir.</p>
        <h3>Toplanan Kişisel Veriler</h3>
        <p>İsim, e-posta, telefon, adres gibi sipariş ve iletişim bilgileriniz toplanmaktadır.</p>
        <h3>Verilerinizin Kullanım Amacı</h3>
        <p>Toplanan veriler sipariş işleme, teslimat, müşteri hizmetleri ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılmaktadır.</p>
        <h3>Verilerinizin Korunması</h3>
        <p>Tüm kişisel verileriniz güvenli sunucularda saklanmakta ve üçüncü taraflarla paylaşılmamaktadır.</p>
        <h3>Haklarınız</h3>
        <p>KVKK kapsamında verilerinize erişim, düzeltme, silme ve itiraz etme haklarınız bulunmaktadır.</p>
      `,
    },
    {
      slug: 'mesafeli-satis-sozlesmesi',
      title: 'Mesafeli Satış Sözleşmesi',
      content: `
        <h2>Mesafeli Satış Sözleşmesi</h2>
        <h3>1. Taraflar</h3>
        <p>Bu sözleşme, Zen Sticker (Satıcı) ile internet sitesi üzerinden alışveriş yapan Müşteri arasında akdedilmiştir.</p>
        <h3>2. Sözleşme Konusu</h3>
        <p>Bu sözleşme, Satıcı'nın internet sitesinde satışa sunulan ürünlerin satışı ve teslimi ile ilgili hak ve yükümlülükleri düzenlemektedir.</p>
        <h3>3. Sipariş ve Ödeme</h3>
        <p>Müşteri, internet sitesinde yer alan ürünleri seçerek sipariş verebilir. Ödeme, güvenli ödeme sistemleri üzerinden yapılır.</p>
        <h3>4. Teslimat</h3>
        <p>Ürünler, Müşteri'nin belirttiği adrese kargo ile teslim edilir. Teslimat süresi stok durumuna göre değişkenlik gösterebilir.</p>
        <h3>5. Fiyat</h3>
        <p>Tüm fiyatlar Türk Lirası (₺) cinsinden belirtilmiştir ve KDV dahildir.</p>
        <h3>6. Cayma Hakkı</h3>
        <p>Müşteri, 14 gün içinde cayma hakkını kullanabilir.</p>
      `,
    },
    {
      slug: 'cayma-hakki',
      title: 'Cayma Hakkı',
      content: `
        <h2>Cayma Hakkı</h2>
        <p>Mesafeli satış sözleşmelerinde, tüketicilerin 14 gün süreyle hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkı bulunmaktadır.</p>
        <h3>Cayma Hakkının Kullanımı</h3>
        <p>Cayma hakkını kullanmak için:</p>
        <ul>
          <li>14 gün içinde bizimle iletişime geçin</li>
          <li>Ürünü kullanılmamış ve orijinal ambalajında iade edin</li>
          <li>İade kargo ücreti müşteriye aittir</li>
        </ul>
        <h3>İade İşlemi</h3>
        <p>İade edilen ürünün bedeli, 14 iş günü içinde ödeme yapıldığı yönteme geri ödenir.</p>
        <h3>Cayma Hakkının Olmadığı Durumlar</h3>
        <ul>
          <li>Müşterinin talebiyle özel olarak hazırlanan ürünler</li>
          <li>Kullanılmış veya hasar görmüş ürünler</li>
        </ul>
      `,
    },
    {
      slug: 'iade-ve-degisim',
      title: 'İade ve Değişim',
      content: `
        <h2>İade ve Değişim Koşulları</h2>
        <h3>İade Koşulları</h3>
        <ul>
          <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</li>
          <li>14 gün içinde iade talebinde bulunulmalıdır</li>
          <li>İade kargo ücreti müşteriye aittir</li>
          <li>Ürün hasarlı veya eksik ise iade kabul edilmez</li>
        </ul>
        <h3>Değişim Koşulları</h3>
        <p>Ürün değişimi için aynı iade koşulları geçerlidir. Değişim yapmak istediğiniz ürün stokta bulunmalıdır.</p>
        <h3>İade İşlemi</h3>
        <ol>
          <li>Müşteri hizmetlerimizle iletişime geçin</li>
          <li>İade formunu doldurun</li>
          <li>Ürünü orijinal ambalajında kargoya verin</li>
          <li>İade onaylandıktan sonra ödeme iade edilir</li>
        </ol>
        <h3>İade Adresi</h3>
        <p>İade için lütfen müşteri hizmetlerimizle iletişime geçin. Size iade adresini ileteceğiz.</p>
      `,
    },
    {
      slug: 'kargo-ve-teslimat',
      title: 'Kargo ve Teslimat',
      content: `
        <h2>Kargo ve Teslimat Bilgileri</h2>
        <h3>Teslimat Süresi</h3>
        <ul>
          <li><strong>Aynı Gün Kargo:</strong> Saat 15:00'a kadar verilen siparişler aynı gün kargoya verilir</li>
          <li><strong>Normal Teslimat:</strong> 1-3 iş günü içinde teslim edilir</li>
          <li><strong>Özel Ürünler:</strong> Üretim süresi + kargo süresi</li>
        </ul>
        <h3>Kargo Ücreti</h3>
        <ul>
          <li>200₺ ve üzeri siparişlerde <strong>ÜCRETSİZ KARGO</strong></li>
          <li>200₺ altı siparişlerde 25₺ kargo ücreti</li>
        </ul>
        <h3>Teslimat Bölgeleri</h3>
        <p>Türkiye'nin tüm illerine kargo hizmeti sunmaktayız.</p>
        <h3>Kargo Takibi</h3>
        <p>Siparişinizin durumunu "Kargo Takip" sayfasından takip edebilirsiniz. Kargo takip numaranız sipariş onayından sonra e-posta ile gönderilir.</p>
        <h3>Teslimat Sonrası</h3>
        <p>Ürünü teslim aldıktan sonra kontrol edin. Herhangi bir sorun varsa 24 saat içinde bizimle iletişime geçin.</p>
      `,
    },
  ]

  for (const page of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
      },
      create: page,
    })
  }
  console.log('  ✓ Static pages created')

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

