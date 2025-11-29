import { prisma } from '@/lib/prisma'
import { FooterSettingsForm } from '@/components/admin/FooterSettingsForm'

export default async function AdminFooterSettingsPage() {
  const settings = await prisma.siteSettings.findFirst()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Footer Ayarları</h1>
        <p className="text-gray-600 mt-2">Footer içeriğini düzenleyin.</p>
      </div>

      <FooterSettingsForm settings={settings} />
    </div>
  )
}

