import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Tüm siparişler siliniyor...')

  try {
    // Önce OrderItem'ları sil (foreign key constraint nedeniyle)
    const deletedItems = await prisma.orderItem.deleteMany({})
    console.log(`✅ ${deletedItems.count} sipariş kalemi silindi`)

    // Sonra Order'ları sil
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`✅ ${deletedOrders.count} sipariş silindi`)

    console.log('\n✨ Tüm siparişler başarıyla silindi!')
    console.log('📊 Site artık canlıya hazır.')
  } catch (error) {
    console.error('❌ Hata:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Script hatası:', error)
    process.exit(1)
  })

