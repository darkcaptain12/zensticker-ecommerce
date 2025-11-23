import * as fs from 'fs'
import * as path from 'path'

const sourceDirs = [
  { from: 'logo', to: 'public/logo' },
  { from: 'banner', to: 'public/banner' },
  { from: 'ürün_görselleri', to: 'public/products' },
]

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source directory not found: ${src}`)
    return
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      console.log(`✓ Copied: ${entry.name}`)
    }
  }
}

console.log('📁 Copying assets to public folder...')

for (const dir of sourceDirs) {
  const srcPath = path.join(process.cwd(), dir.from)
  const destPath = path.join(process.cwd(), dir.to)
  console.log(`\n📂 ${dir.from} → ${dir.to}`)
  copyDir(srcPath, destPath)
}

console.log('\n✅ Assets copied successfully!')

