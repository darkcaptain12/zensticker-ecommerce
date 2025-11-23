import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  Image as ImageIcon,
  FileText,
  Tag,
} from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/giris')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/urunler">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <Package className="h-4 w-4 mr-2" />
                Ürünler
              </Button>
            </Link>
            <Link href="/admin/kategoriler">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <FolderTree className="h-4 w-4 mr-2" />
                Kategoriler
              </Button>
            </Link>
            <Link href="/admin/siparisler">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Siparişler
              </Button>
            </Link>
            <Link href="/admin/kullanicilar">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <Users className="h-4 w-4 mr-2" />
                Kullanıcılar
              </Button>
            </Link>
            <Link href="/admin/banner">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <ImageIcon className="h-4 w-4 mr-2" />
                Bannerlar
              </Button>
            </Link>
            <Link href="/admin/kampanyalar">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <Tag className="h-4 w-4 mr-2" />
                Kampanyalar
              </Button>
            </Link>
            <Link href="/admin/static-pages">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <FileText className="h-4 w-4 mr-2" />
                Statik Sayfalar
              </Button>
            </Link>
            <Link href="/admin/site-ayarlari">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                <Settings className="h-4 w-4 mr-2" />
                Site Ayarları
              </Button>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

