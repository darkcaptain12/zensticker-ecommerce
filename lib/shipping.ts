/**
 * Generate tracking URL based on carrier and tracking number
 * @param carrier - The shipping carrier code (yurtici, aras, mng, surat, ptt)
 * @param trackingNumber - The tracking number provided by the carrier
 * @returns The full tracking URL to embed in an iframe
 */
export function generateTrackingUrl(carrier: string, trackingNumber: string): string {
  if (!carrier || !trackingNumber) {
    return ''
  }

  switch (carrier.toLowerCase()) {
    case 'yurtici':
    case 'yurticikargo':
      return `https://selfservis.yurticikargo.com/reports/SSWDocumentDetail.aspx?DocId=${encodeURIComponent(trackingNumber)}`
    
    case 'aras':
    case 'araskargo':
      return `https://kargotakip.araskargo.com.tr/?code=${encodeURIComponent(trackingNumber)}`
    
    case 'mng':
    case 'mngkargo':
      return `https://apimngkargo.mngkargo.com.tr/takip?no=${encodeURIComponent(trackingNumber)}`
    
    case 'surat':
    case 'suratkargo':
      return `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(trackingNumber)}`
    
    case 'ptt':
    case 'pttkargo':
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(trackingNumber)}`
    
    case 'ups':
      return `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`
    
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`
    
    case 'dhl':
      return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trackingNumber)}`
    
    case 'sendeo':
      return `https://www.sendeo.com.tr/kargo-takip?takipNo=${encodeURIComponent(trackingNumber)}`
    
    case 'horoz':
    case 'horozkargo':
      return `https://www.horozkargo.com.tr/kargo-takip?takipNo=${encodeURIComponent(trackingNumber)}`
    
    case 'tnt':
      return `https://www.tnt.com/express/tr_tr/site/shipping-tools/tracking.html?searchType=con&cons=${encodeURIComponent(trackingNumber)}`
    
    default:
      // Try to generate a generic URL if carrier is unknown
      return ''
  }
}

/**
 * Get human-friendly carrier name
 */
export function getCarrierName(carrier: string | null | undefined): string {
  if (!carrier) return ''
  
  const carrierNames: { [key: string]: string } = {
    yurtici: 'Yurtiçi Kargo',
    yurticikargo: 'Yurtiçi Kargo',
    aras: 'Aras Kargo',
    araskargo: 'Aras Kargo',
    mng: 'MNG Kargo',
    mngkargo: 'MNG Kargo',
    surat: 'Sürat Kargo',
    suratkargo: 'Sürat Kargo',
    ptt: 'PTT Kargo',
    pttkargo: 'PTT Kargo',
    ups: 'UPS',
    fedex: 'FedEx',
    dhl: 'DHL',
    sendeo: 'Sendeo Kargo',
    horoz: 'Horoz Kargo',
    horozkargo: 'Horoz Kargo',
    tnt: 'TNT',
  }
  
  return carrierNames[carrier.toLowerCase()] || carrier
}

