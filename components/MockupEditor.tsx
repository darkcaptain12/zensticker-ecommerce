'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Download, RotateCw, X, Move, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  images: Array<{ url: string }>
  category: { name: string }
}

interface PlacedSticker {
  id: string
  productId: string
  productName: string
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scale: number
}

interface MockupEditorProps {
  products: Product[]
}

export function MockupEditor({ products }: MockupEditorProps) {
  const [carImage, setCarImage] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([])
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCarImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product && carImage) {
      const newSticker: PlacedSticker = {
        id: `sticker-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        imageUrl: product.images[0]?.url || '/placeholder-product.jpg',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        scale: 1,
      }
      setPlacedStickers([...placedStickers, newSticker])
      setSelectedSticker(newSticker.id)
      setSelectedProduct(null)
    }
  }

  const handleStickerMouseDown = (e: React.MouseEvent, stickerId: string) => {
    e.stopPropagation()
    setSelectedSticker(stickerId)
    setIsDragging(true)
    
    const sticker = placedStickers.find(s => s.id === stickerId)
    if (sticker && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left - sticker.x,
        y: e.clientY - rect.top - sticker.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedSticker && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x
      const y = e.clientY - rect.top - dragOffset.y
      
      setPlacedStickers(placedStickers.map(sticker =>
        sticker.id === selectedSticker
          ? { ...sticker, x: Math.max(0, Math.min(x, rect.width - sticker.width)), y: Math.max(0, Math.min(y, rect.height - sticker.height)) }
          : sticker
      ))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleRotate = (stickerId: string, direction: 'left' | 'right') => {
    setPlacedStickers(placedStickers.map(sticker =>
      sticker.id === stickerId
        ? { ...sticker, rotation: sticker.rotation + (direction === 'right' ? 15 : -15) }
        : sticker
    ))
  }

  const handleScale = (stickerId: string, direction: 'in' | 'out') => {
    setPlacedStickers(placedStickers.map(sticker =>
      sticker.id === stickerId
        ? { ...sticker, scale: Math.max(0.5, Math.min(2, sticker.scale + (direction === 'in' ? 0.1 : -0.1))) }
        : sticker
    ))
  }

  const handleDelete = (stickerId: string) => {
    setPlacedStickers(placedStickers.filter(s => s.id !== stickerId))
    if (selectedSticker === stickerId) {
      setSelectedSticker(null)
    }
  }

  const handleDownload = () => {
    if (!carImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw all stickers
      placedStickers.forEach(sticker => {
        const stickerImg = new window.Image()
        stickerImg.crossOrigin = 'anonymous'
        stickerImg.onload = () => {
          ctx.save()
          ctx.translate(sticker.x, sticker.y)
          ctx.rotate((sticker.rotation * Math.PI) / 180)
          ctx.scale(sticker.scale, sticker.scale)
          ctx.drawImage(
            stickerImg,
            -sticker.width / 2,
            -sticker.height / 2,
            sticker.width,
            sticker.height
          )
          ctx.restore()

          // Download when all stickers are drawn
          if (placedStickers.indexOf(sticker) === placedStickers.length - 1) {
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'mockup.png'
                a.click()
                URL.revokeObjectURL(url)
              }
            })
          }
        }
        stickerImg.src = sticker.imageUrl
      })
    }
    img.src = carImage
  }

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category.name
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Product Selection */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ürün Seç</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category}>
                <h3 className="font-semibold mb-2 text-sm text-gray-600">{category}</h3>
                <div className="space-y-2">
                  {categoryProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className="w-full p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-sm font-medium truncate">{product.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas Area */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Editör</CardTitle>
          </CardHeader>
          <CardContent>
            {!carImage ? (
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="car-image" className="cursor-pointer">
                  <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Araç Fotoğrafı Yükle
                  </span>
                </Label>
                <Input
                  ref={fileInputRef}
                  id="car-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  ref={canvasRef}
                  className="relative border rounded-lg overflow-hidden bg-gray-100"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ minHeight: '500px' }}
                >
                  <img
                    src={carImage}
                    alt="Car"
                    className="w-full h-auto"
                    style={{ display: 'block' }}
                  />
                  {placedStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
                      className={`absolute cursor-move transition-all ${
                        selectedSticker === sticker.id ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        left: `${sticker.x}px`,
                        top: `${sticker.y}px`,
                        width: `${sticker.width}px`,
                        height: `${sticker.height}px`,
                        transform: `rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                        transformOrigin: 'center',
                      }}
                    >
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.productName}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                      {selectedSticker === sticker.id && (
                        <div className="absolute -top-8 left-0 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRotate(sticker.id, 'left')}
                            className="h-6 w-6 p-0"
                          >
                            <RotateCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScale(sticker.id, 'in')}
                            className="h-6 w-6 p-0"
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleScale(sticker.id, 'out')}
                            className="h-6 w-6 p-0"
                          >
                            <ZoomOut className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(sticker.id)}
                            className="h-6 w-6 p-0 text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    PNG Olarak İndir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCarImage(null)
                      setPlacedStickers([])
                      setSelectedSticker(null)
                    }}
                  >
                    Sıfırla
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Placed Stickers */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Yerleştirilen Sticker'lar</CardTitle>
          </CardHeader>
          <CardContent>
            {placedStickers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Henüz sticker eklenmedi
              </p>
            ) : (
              <div className="space-y-2">
                {placedStickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    className={`p-2 border rounded cursor-pointer transition ${
                      selectedSticker === sticker.id
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedSticker(sticker.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sticker.productName}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round(sticker.scale * 100)}% • {sticker.rotation}°
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(sticker.id)
                        }}
                        className="text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

