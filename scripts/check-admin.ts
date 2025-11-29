import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin() {
  console.log('🔍 Checking admin user...\n')

  try {
    // Admin kullanıcısını kontrol et
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@zensticker.com' },
    })

    if (admin) {
      console.log('✅ Admin kullanıcısı bulundu!')
      console.log('   Email:', admin.email)
      console.log('   Ad:', admin.name)
      console.log('   Rol:', admin.role)
      console.log('   ID:', admin.id)
      console.log('   Oluşturulma:', admin.createdAt)
    } else {
      console.log('❌ Admin kullanıcısı bulunamadı!')
      console.log('\n💡 Çözüm: Seed scripti çalıştırın:')
      console.log('   npm run db:seed')
    }

    // Tüm kullanıcıları listele
    console.log('\n📋 Tüm kullanıcılar:')
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (allUsers.length === 0) {
      console.log('   Hiç kullanıcı yok!')
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.name}`)
      })
    }

    // Environment değişkenlerini kontrol et
    console.log('\n🔐 Environment Kontrolleri:')
    console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Tanımlı' : '❌ Tanımsız')
    console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Tanımsız')
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Tanımlı' : '❌ Tanımsız')

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()

