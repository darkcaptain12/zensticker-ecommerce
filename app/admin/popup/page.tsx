import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignPopupForm } from '@/components/admin/CampaignPopupForm'

export default async function AdminPopupPage() {
  const popup = await prisma.campaignPopup.findFirst()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kampanya Pop-up Yönetimi</h1>
      <CampaignPopupForm popup={popup} />
    </div>
  )
}

