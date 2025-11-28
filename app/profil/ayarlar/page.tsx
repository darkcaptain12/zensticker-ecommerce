import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Breadcrumb } from '@/components/Breadcrumb'
import { AccountSettings } from '@/components/AccountSettings'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Profil', href: '/profil' },
          { label: 'Hesap Ayarları' },
        ]}
      />
      
      <h1 className="text-3xl font-bold mb-8">Hesap Ayarları</h1>

      <AccountSettings user={session.user} />
    </div>
  )
}

