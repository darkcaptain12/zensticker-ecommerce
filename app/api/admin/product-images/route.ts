import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const productsDir = join(process.cwd(), 'public', 'products')
    const images: string[] = []

    async function scanDirectory(dir: string, basePath: string = '') {
      try {
        const entries = await readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)
          const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name

          if (entry.isDirectory()) {
            await scanDirectory(fullPath, relativePath)
          } else if (entry.isFile()) {
            const ext = entry.name.toLowerCase().split('.').pop()
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
              images.push(`/products/${relativePath}`)
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
        console.error(`Error scanning ${dir}:`, error)
      }
    }

    await scanDirectory(productsDir)
    
    // Sort images alphabetically
    images.sort()

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images', images: [] },
      { status: 500 }
    )
  }
}

