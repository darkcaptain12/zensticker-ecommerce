import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/Breadcrumb'
import { AddressManager } from '@/components/AddressManager'

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/giris')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      addresses: {
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      },
    },
  })

  if (!user) {
    redirect('/giris')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Profil', href: '/profil' },
          { label: 'Adreslerim' },
        ]}
      />
      
      <h1 className="text-3xl font-bold mb-8">Adreslerim</h1>

      <AddressManager userId={user.id} initialAddresses={user.addresses} />
    </div>
  )
}

