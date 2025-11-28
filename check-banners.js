const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkBanners() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
  })
  console.log('Aktif Banner Sayısı:', banners.length)
  if (banners.length > 0) {
    console.log('Bannerlar:')
    banners.forEach(b => {
      console.log(`- ${b.title}: ${b.filePath} (Aktif: ${b.isActive}, Pozisyon: ${b.position})`)
    })
  } else {
    console.log('⚠️  Veritabanında aktif banner yok!')
    const allBanners = await prisma.banner.findMany()
    console.log(`Toplam banner sayısı: ${allBanners.length}`)
    if (allBanners.length > 0) {
      console.log('Tüm bannerlar:')
      allBanners.forEach(b => {
        console.log(`- ${b.title}: ${b.filePath} (Aktif: ${b.isActive}, Pozisyon: ${b.position})`)
      })
    }
  }
  await prisma.$disconnect()
}

checkBanners().catch(console.error)
