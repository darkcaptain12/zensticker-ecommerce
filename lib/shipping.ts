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
      return `https://selfservis.yurticikargo.com/reports/SSWDocumentDetail.aspx?DocId=${encodeURIComponent(trackingNumber)}`
    
    case 'aras':
      return `https://kargotakip.araskargo.com.tr/?code=${encodeURIComponent(trackingNumber)}`
    
    case 'mng':
      return `https://apimngkargo.mngkargo.com.tr/takip?no=${encodeURIComponent(trackingNumber)}`
    
    case 'surat':
      return `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${encodeURIComponent(trackingNumber)}`
    
    case 'ptt':
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(trackingNumber)}`
    
    default:
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
    aras: 'Aras Kargo',
    mng: 'MNG Kargo',
    surat: 'Sürat Kargo',
    ptt: 'PTT Kargo',
  }
  
  return carrierNames[carrier.toLowerCase()] || carrier
}

