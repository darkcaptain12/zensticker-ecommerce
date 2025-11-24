import { prisma } from '../lib/prisma'
import { AVAILABLE_FONTS } from '../lib/fonts'

async function updateFonts() {
  console.log('🔄 Updating font lists for all customizable products...')

  try {
    // Get all customizable products with their custom options
    const products = await prisma.product.findMany({
      where: {
        isCustomizable: true,
      },
      include: {
        customOptions: true,
      },
    })

    console.log(`Found ${products.length} customizable products`)

    let updated = 0
    let created = 0

    for (const product of products) {
      if (product.customOptions) {
        // Update existing custom options
        await prisma.customStickerOption.update({
          where: { productId: product.id },
          data: {
            availableFonts: AVAILABLE_FONTS,
          },
        })
        updated++
        console.log(`  ✓ Updated fonts for: ${product.name}`)
      } else {
        // Create custom options if they don't exist
        await prisma.customStickerOption.create({
          data: {
            productId: product.id,
            label: 'İsim Stickerı',
            availableFonts: AVAILABLE_FONTS,
            maxCharacters: 50,
          },
        })
        created++
        console.log(`  ✓ Created custom options for: ${product.name}`)
      }
    }

    console.log(`\n✅ Successfully updated ${updated} products`)
    console.log(`✅ Successfully created ${created} custom options`)
    console.log(`\n📝 Total fonts available: ${AVAILABLE_FONTS.length}`)
  } catch (error) {
    console.error('❌ Error updating fonts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateFonts()
  .then(() => {
    console.log('\n🎉 Font update completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Font update failed:', error)
    process.exit(1)
  })

