import { BannerForm } from '@/components/admin/BannerForm'

const availableBanners = Array.from({ length: 15 }, (_, i) => `/banner/banner${i + 1}.png`)

export default function NewBannerPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Yeni Banner</h1>
      <BannerForm availableBanners={availableBanners} />
    </div>
  )
}
