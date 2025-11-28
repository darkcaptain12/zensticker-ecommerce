import { prisma } from '@/lib/prisma'
import { SocialProofSection } from './SocialProofSection'

export async function SocialProofSectionWrapper() {
  const siteSettings = await prisma.siteSettings.findFirst()
  const enabled = siteSettings?.socialProofEnabled ?? true
  
  return <SocialProofSection enabled={enabled} />
}

