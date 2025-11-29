import { prisma } from './prisma'

export interface CampaignPriceResult {
  finalPrice: number
  originalPrice: number | null
  hasCampaign: boolean
  campaignTitle?: string
  campaignDiscount?: number
}

/**
 * Calculate product price with active campaigns applied
 * Checks GENERAL, CATEGORY, and PRODUCT type campaigns
 */
export async function calculateCampaignPrice(
  product: {
    id: string
    price: number
    salePrice?: number | null
    categoryId: string | null
  }
): Promise<CampaignPriceResult> {
  const now = new Date()
  let finalPrice = product.salePrice || product.price
  let originalPrice = product.salePrice ? product.price : null
  let hasCampaign = false
  let campaignTitle: string | undefined
  let campaignDiscount: number | undefined

  // Get all active campaigns (exclude campaigns with codes - they require manual code entry)
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      campaignCode: null, // Only campaigns without codes are auto-applied
      OR: [
        { type: 'GENERAL' }, // Applies to all products
        { type: 'CATEGORY', categories: product.categoryId ? { some: { id: product.categoryId } } : undefined },
        { type: 'PRODUCT', directProducts: { some: { id: product.id } } },
      ],
    },
    include: {
      categories: true,
      directProducts: true,
    },
    orderBy: [
      { discountPercent: 'desc' }, // Prefer percentage discounts
      { discountAmount: 'desc' },
    ],
  })

  if (activeCampaigns.length > 0) {
    // Use the first (best) campaign
    const campaign = activeCampaigns[0]
    
    // Check if campaign applies to this product
    let applies = false
    
    if (campaign.type === 'GENERAL') {
      applies = true
    } else if (campaign.type === 'CATEGORY' && product.categoryId) {
      applies = campaign.categories.some(cat => cat.id === product.categoryId)
    } else if (campaign.type === 'PRODUCT') {
      applies = campaign.directProducts.some(prod => prod.id === product.id)
    }

    if (applies) {
      hasCampaign = true
      campaignTitle = campaign.title
      
      if (campaign.discountPercent) {
        campaignDiscount = (finalPrice * campaign.discountPercent) / 100
        originalPrice = finalPrice
        finalPrice = finalPrice - campaignDiscount
      } else if (campaign.discountAmount) {
        campaignDiscount = campaign.discountAmount
        originalPrice = finalPrice
        finalPrice = Math.max(0, finalPrice - campaign.discountAmount)
      }
    }
  }

  return {
    finalPrice,
    originalPrice,
    hasCampaign,
    campaignTitle,
    campaignDiscount,
  }
}

/**
 * Batch calculate campaign prices for multiple products
 */
export async function calculateCampaignPrices(
  products: Array<{
    id: string
    price: number
    salePrice?: number | null
    categoryId: string | null
  }>
): Promise<Map<string, CampaignPriceResult>> {
  const now = new Date()
  const results = new Map<string, CampaignPriceResult>()

  // Get all active campaigns once (exclude campaigns with codes - they require manual code entry)
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      campaignCode: null, // Only campaigns without codes are auto-applied
      OR: [
        { type: 'GENERAL' },
        { type: 'CATEGORY' },
        { type: 'PRODUCT' },
      ],
    },
    include: {
      categories: true,
      directProducts: true,
    },
    orderBy: [
      { discountPercent: 'desc' },
      { discountAmount: 'desc' },
    ],
  })

  // Create maps for faster lookup
  const categoryCampaigns = new Map<string, typeof activeCampaigns>()
  const productCampaigns = new Map<string, typeof activeCampaigns>()
  let generalCampaign: typeof activeCampaigns[0] | null = null

  activeCampaigns.forEach(campaign => {
    if (campaign.type === 'GENERAL') {
      generalCampaign = campaign
    } else if (campaign.type === 'CATEGORY') {
      campaign.categories.forEach(cat => {
        if (!categoryCampaigns.has(cat.id)) {
          categoryCampaigns.set(cat.id, [])
        }
        categoryCampaigns.get(cat.id)!.push(campaign)
      })
    } else if (campaign.type === 'PRODUCT') {
      campaign.directProducts.forEach(prod => {
        if (!productCampaigns.has(prod.id)) {
          productCampaigns.set(prod.id, [])
        }
        productCampaigns.get(prod.id)!.push(campaign)
      })
    }
  })

  // Calculate prices for each product
  products.forEach(product => {
    let finalPrice = product.salePrice || product.price
    let originalPrice = product.salePrice ? product.price : null
    let hasCampaign = false
    let campaignTitle: string | undefined
    let campaignDiscount: number | undefined

    // Find applicable campaign (priority: PRODUCT > CATEGORY > GENERAL)
    let campaign: typeof activeCampaigns[0] | null = null

    if (productCampaigns.has(product.id)) {
      campaign = productCampaigns.get(product.id)![0]
    } else if (product.categoryId && categoryCampaigns.has(product.categoryId)) {
      campaign = categoryCampaigns.get(product.categoryId)![0]
    } else if (generalCampaign) {
      campaign = generalCampaign
    }

    if (campaign) {
      hasCampaign = true
      campaignTitle = campaign.title
      
      if (campaign.discountPercent) {
        campaignDiscount = (finalPrice * campaign.discountPercent) / 100
        originalPrice = finalPrice
        finalPrice = finalPrice - campaignDiscount
      } else if (campaign.discountAmount) {
        campaignDiscount = campaign.discountAmount
        originalPrice = finalPrice
        finalPrice = Math.max(0, finalPrice - campaign.discountAmount)
      }
    }

    results.set(product.id, {
      finalPrice,
      originalPrice,
      hasCampaign,
      campaignTitle,
      campaignDiscount,
    })
  })

  return results
}

