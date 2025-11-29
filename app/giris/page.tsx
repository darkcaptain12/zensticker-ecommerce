'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Eğer zaten giriş yapılmışsa yönlendir
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const callbackUrl = searchParams.get('callbackUrl')
      if (callbackUrl) {
        router.push(callbackUrl)
      } else if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [session, status, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('E-posta veya şifre hatalı')
        setLoading(false)
        return
      }

      if (result?.ok) {
        console.log('✅ Giriş başarılı! Session güncelleniyor...')
        
        // Session'ı güncelle
        const updated = await update()
        console.log('Session update result:', updated)
        
        // Session'ı kontrol et ve yönlendir
        const checkAndRedirect = async () => {
          try {
            const sessionRes = await fetch('/api/auth/session', {
              credentials: 'include',
              cache: 'no-store',
            })
            const sessionData = await sessionRes.json()
            
            console.log('📋 Session data:', sessionData)
            console.log('👤 User role:', sessionData?.user?.role)
            
            const callbackUrl = searchParams.get('callbackUrl')
            
            if (callbackUrl) {
              console.log('🔀 Yönlendiriliyor:', callbackUrl)
              window.location.href = callbackUrl
            } else if (sessionData?.user?.role === 'ADMIN') {
              console.log('🔀 Admin paneline yönlendiriliyor')
              window.location.href = '/admin'
      } else {
              console.log('🔀 Ana sayfaya yönlendiriliyor')
              window.location.href = '/'
            }
          } catch (err) {
            console.error('❌ Session kontrol hatası:', err)
            // Hata olsa bile admin'e yönlendir (admin olabilir)
            window.location.href = '/admin'
          }
        }
        
        // 500ms bekle ve kontrol et
        setTimeout(checkAndRedirect, 500)
      }
    } catch (error) {
      console.error('Login exception:', error)
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link href="/kayit" className="text-primary hover:underline">
                Kayıt Ol
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">Yükleniyor...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

