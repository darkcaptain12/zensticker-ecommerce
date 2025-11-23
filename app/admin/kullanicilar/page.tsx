import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kullanıcılar</h1>
      <p className="text-gray-600 mb-4">
        Not: Kullanıcı rolleri Prisma Studio'dan değiştirilebilir.
      </p>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  {user.role === 'ADMIN' ? (
                    <Badge className="bg-red-500">Admin</Badge>
                  ) : (
                    <Badge className="bg-blue-500">Müşteri</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

