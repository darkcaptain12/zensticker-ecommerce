import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'

export default async function AdminSiteSettingsPage() {
  const settings = await prisma.siteSettings.findFirst()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Site Ayarları</h1>
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteSettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}

