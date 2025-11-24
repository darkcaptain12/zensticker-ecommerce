import { prisma } from '../lib/prisma'
import { generateOrderNumber } from '../lib/utils'

// Sample customer data
const sampleCustomers = [
  { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', phone: '05551234567', address: 'İstanbul, Kadıköy, Acıbadem Mahallesi, Test Sokak No:1' },
  { name: 'Ayşe Demir', email: 'ayse@example.com', phone: '05552345678', address: 'Ankara, Çankaya, Kızılay Mahallesi, Test Caddesi No:2' },
  { name: 'Mehmet Kaya', email: 'mehmet@example.com', phone: '05553456789', address: 'İzmir, Konak, Alsancak Mahallesi, Test Sokak No:3' },
  { name: 'Zeynep Çelik', email: 'zeynep@example.com', phone: '05554567890', address: 'Bursa, Nilüfer, Özlüce Mahallesi, Test Caddesi No:4' },
  { name: 'Ali Özkan', email: 'ali@example.com', phone: '05555678901', address: 'Antalya, Muratpaşa, Konyaaltı Mahallesi, Test Sokak No:5' },
]

const orderStatuses: Array<'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED'> = ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED']

async function createSampleOrders() {
  console.log('🛒 Starting to create sample orders...')

  try {
    // Get all products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        customOptions: true,
        campaign: true,
      },
    })

    if (products.length === 0) {
      console.log('❌ No products found. Please create products first.')
      return
    }

    console.log(`📦 Found ${products.length} products`)

    // Get a user for orders (or create one)
    let user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
    })

    if (!user) {
      // Create a sample customer user
      const bcrypt = await import('bcryptjs')
      const passwordHash = await bcrypt.default.hash('Customer123!', 10)
      user = await prisma.user.create({
        data: {
          name: 'Test Customer',
          email: 'customer@example.com',
          passwordHash,
          role: 'CUSTOMER',
        },
      })
      console.log('  ✓ Created sample customer user')
    }

    let ordersCreated = 0

    // Create one order for each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const customer = sampleCustomers[i % sampleCustomers.length]
      
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - daysAgo)
      createdAt.setHours(Math.floor(Math.random() * 24))
      createdAt.setMinutes(Math.floor(Math.random() * 60))

      // Calculate price
      let unitPrice = product.salePrice || product.price
      let finalPrice = unitPrice

      // Apply campaign discount if exists
      if (product.campaign && product.campaign.isActive) {
        const now = new Date()
        const startDate = new Date(product.campaign.startDate)
        const endDate = new Date(product.campaign.endDate)
        
        if (now >= startDate && now <= endDate) {
          if (product.campaign.discountPercent) {
            finalPrice = unitPrice - (unitPrice * product.campaign.discountPercent / 100)
          } else if (product.campaign.discountAmount) {
            finalPrice = Math.max(0, unitPrice - product.campaign.discountAmount)
          }
        }
      }

      // Random order status (mostly delivered/shipped for past orders)
      const statusIndex = Math.floor(Math.random() * orderStatuses.length)
      const status = orderStatuses[statusIndex]

      // Custom text for customizable products
      let customText: string | null = null
      let customFont: string | null = null
      
      if (product.isCustomizable && product.customOptions) {
        const fonts = product.customOptions.availableFonts as string[]
        if (fonts && fonts.length > 0) {
          customText = product.name.includes('İsim') || product.name.includes('İnan') 
            ? `Örnek İsim ${i + 1}` 
            : 'Özel Metin'
          customFont = fonts[Math.floor(Math.random() * fonts.length)]
        }
      }

      const orderNumber = generateOrderNumber()
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          status,
          totalAmount: finalPrice,
          paymentProvider: 'PAYTR',
          paytrRefCode: `PAYTR${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          notes: `Örnek sipariş - ${product.name}`,
          createdAt,
          updatedAt: createdAt,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              unitPrice: finalPrice,
              lineTotal: finalPrice,
              customText,
              customFont,
            },
          },
        },
      })

      ordersCreated++
      console.log(`  ✓ Created order ${ordersCreated}/${products.length}: ${orderNumber} - ${product.name} (${status})`)
    }

    console.log(`\n✅ Successfully created ${ordersCreated} sample orders!`)
    console.log(`📊 Orders distributed across ${sampleCustomers.length} customers`)
    console.log(`📅 Orders created with dates from last 30 days`)
  } catch (error) {
    console.error('❌ Error creating sample orders:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createSampleOrders()
  .then(() => {
    console.log('\n🎉 Sample orders creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Sample orders creation failed:', error)
    process.exit(1)
  })

