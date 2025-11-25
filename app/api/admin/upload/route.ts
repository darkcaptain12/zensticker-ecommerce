import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'products'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: images (jpg, png, gif, webp) and videos (mp4, webm, ogg)' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for videos, 10MB for images
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${isVideo ? '50MB' : '10MB'}` },
        { status: 400 }
      )
    }

    // Check if we're in Vercel (read-only filesystem)
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV

    if (isVercel) {
      // Vercel'de dosya sistemi read-only, bu yüzden hata mesajı ver
      return NextResponse.json(
        { 
          error: 'Vercel ortamında dosya yükleme desteklenmiyor. Lütfen Vercel Blob Storage veya başka bir cloud storage servisi kullanın. Şu anda sadece manuel URL girişi kullanılabilir.',
          requiresCloudStorage: true
        },
        { status: 503 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const extension = path.extname(originalName)
    const baseName = path.basename(originalName, extension)
    const fileName = `${baseName}_${timestamp}${extension}`
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', folder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // For videos, use 'videos' folder
    const actualFolder = isVideo ? 'videos' : folder
    const actualUploadDir = path.join(process.cwd(), 'public', actualFolder)
    if (!existsSync(actualUploadDir)) {
      await mkdir(actualUploadDir, { recursive: true })
    }

    // Save file
    const finalUploadDir = isVideo ? actualUploadDir : uploadDir
    const filePath = path.join(finalUploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    try {
      await writeFile(filePath, buffer)
    } catch (writeError: any) {
      // Eğer dosya yazma hatası alırsak (read-only filesystem), daha açıklayıcı hata ver
      if (writeError.code === 'EROFS' || writeError.message?.includes('read-only')) {
        return NextResponse.json(
          { 
            error: 'Dosya sistemi salt okunur. Vercel gibi serverless ortamlarda dosya yükleme desteklenmiyor. Lütfen "Manuel URL Gir" seçeneğini kullanarak video URL\'si girin.',
            requiresCloudStorage: true
          },
          { status: 503 }
        )
      }
      throw writeError
    }

    // Return the public URL
    const publicUrl = `/${actualFolder}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    
    // Read-only filesystem hatası için özel mesaj
    if (error.code === 'EROFS' || error.message?.includes('read-only')) {
      return NextResponse.json(
        { 
          error: 'Dosya sistemi salt okunur. Vercel gibi serverless ortamlarda dosya yükleme desteklenmiyor. Lütfen "Manuel URL Gir" seçeneğini kullanarak video URL\'si girin.',
          requiresCloudStorage: true
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

