import { prisma } from '../lib/prisma'
import { generateOrderNumber } from '../lib/utils'

// Sample customer data
const sampleCustomers = [
  { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', phone: '05551234567', address: 'İstanbul, Kadıköy, Acıbadem Mahallesi, Test Sokak No:1 Daire:5' },
  { name: 'Ayşe Demir', email: 'ayse@example.com', phone: '05552345678', address: 'Ankara, Çankaya, Kızılay Mahallesi, Test Caddesi No:2 Daire:10' },
  { name: 'Mehmet Kaya', email: 'mehmet@example.com', phone: '05553456789', address: 'İzmir, Konak, Alsancak Mahallesi, Test Sokak No:3 Daire:3' },
  { name: 'Zeynep Çelik', email: 'zeynep@example.com', phone: '05554567890', address: 'Bursa, Nilüfer, Özlüce Mahallesi, Test Caddesi No:4 Daire:7' },
  { name: 'Ali Özkan', email: 'ali@example.com', phone: '05555678901', address: 'Antalya, Muratpaşa, Konyaaltı Mahallesi, Test Sokak No:5 Daire:12' },
  { name: 'Fatma Şahin', email: 'fatma@example.com', phone: '05556789012', address: 'Adana, Seyhan, Kurtuluş Mahallesi, Test Caddesi No:6 Daire:4' },
  { name: 'Mustafa Arslan', email: 'mustafa@example.com', phone: '05557890123', address: 'Gaziantep, Şahinbey, Karataş Mahallesi, Test Sokak No:7 Daire:8' },
  { name: 'Elif Yıldız', email: 'elif@example.com', phone: '05558901234', address: 'Kocaeli, İzmit, Merkez Mahallesi, Test Caddesi No:8 Daire:15' },
]

const orderStatuses: Array<'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'> = [
  'PENDING',
  'AWAITING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

async function resetAndCreateOrders() {
  console.log('🗑️  Starting to delete all existing orders...')

  try {
    // Delete all order items first (due to foreign key constraint)
    const deletedItems = await prisma.orderItem.deleteMany({})
    console.log(`  ✓ Deleted ${deletedItems.count} order items`)

    // Delete all orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`  ✓ Deleted ${deletedOrders.count} orders`)
    console.log('✅ All orders deleted successfully!\n')

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
    console.log('🛒 Creating 10 new sample orders...\n')

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

    // Create 10 mixed orders
    for (let i = 0; i < 10; i++) {
      // Random product
      const product = products[Math.floor(Math.random() * products.length)]
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
      const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 items
      finalPrice = unitPrice * quantity

      // Apply campaign discount if exists
      if (product.campaign && product.campaign.isActive) {
        const now = new Date()
        const startDate = new Date(product.campaign.startDate)
        const endDate = new Date(product.campaign.endDate)
        
        if (now >= startDate && now <= endDate) {
          if (product.campaign.discountPercent) {
            finalPrice = finalPrice - (finalPrice * product.campaign.discountPercent / 100)
          } else if (product.campaign.discountAmount) {
            finalPrice = Math.max(0, finalPrice - product.campaign.discountAmount)
          }
        }
      }

      // Random order status
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
      
      // Some orders should have tracking numbers (for SHIPPED, DELIVERED, PREPARING)
      let cargoTrackingNo: string | null = null
      let cargoCompany: string | null = null
      let shipmentStatus: string | null = null
      let shipmentLabelUrl: string | null = null
      let shipmentLastSync: Date | null = null

      if (status === 'SHIPPED' || status === 'DELIVERED' || (status === 'PREPARING' && Math.random() > 0.5)) {
        // orderNumber already starts with "ZEN-", so we use it directly
        cargoTrackingNo = `DHL-${orderNumber}-${Math.floor(1000 + Math.random() * 9000)}`
        cargoCompany = 'DHL'
        shipmentStatus = status === 'DELIVERED' ? 'delivered' : status === 'SHIPPED' ? 'in_transit' : 'label_created'
        shipmentLabelUrl = `/api/admin/mock-label/${cargoTrackingNo}`
        shipmentLastSync = new Date()
      }

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
          notes: `Örnek sipariş ${i + 1} - ${product.name}`,
          cargoCompany,
          cargoTrackingNo,
          shipmentStatus,
          shipmentLabelUrl,
          shipmentLastSync,
          createdAt,
          updatedAt: createdAt,
          items: {
            create: {
              productId: product.id,
              quantity,
              unitPrice: unitPrice,
              lineTotal: finalPrice,
              customText,
              customFont,
            },
          },
        },
      })

      ordersCreated++
      const trackingInfo = cargoTrackingNo ? ` [Takip: ${cargoTrackingNo}]` : ''
      console.log(`  ✓ Created order ${ordersCreated}/10: ${orderNumber} - ${product.name} x${quantity} (${status})${trackingInfo}`)
    }

    console.log(`\n✅ Successfully created ${ordersCreated} sample orders!`)
    console.log(`📊 Orders distributed across ${sampleCustomers.length} customers`)
    console.log(`📅 Orders created with dates from last 30 days`)
    console.log(`📦 Some orders have tracking numbers for testing shipping module`)
  } catch (error) {
    console.error('❌ Error creating sample orders:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetAndCreateOrders()
  .then(() => {
    console.log('\n🎉 Order reset and creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Order reset and creation failed:', error)
    process.exit(1)
  })

