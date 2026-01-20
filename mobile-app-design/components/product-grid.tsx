"use client"

import { Plus, Camera, Check, ImageIcon, Package } from "lucide-react"
import { useState } from "react"
import type { Product } from "./mobile-app"

type ProductGridProps = {
  products: Product[]
  onAddToCart: (product: Product) => void
  isAdmin: boolean
  isPdfMode: boolean
  selectedForPdf: string[]
  onTogglePdfSelection: (productId: string) => void
  isNewArrival?: boolean
}

export function ProductGrid({
  products,
  onAddToCart,
  isAdmin,
  isPdfMode,
  selectedForPdf,
  onTogglePdfSelection,
  isNewArrival,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAdmin={isAdmin}
          isPdfMode={isPdfMode}
          isSelectedForPdf={selectedForPdf.includes(product.id)}
          onTogglePdfSelection={onTogglePdfSelection}
          isNewArrival={isNewArrival}
        />
      ))}
    </div>
  )
}

type ProductCardProps = {
  product: Product
  onAddToCart: (product: Product) => void
  isAdmin: boolean
  isPdfMode: boolean
  isSelectedForPdf: boolean
  onTogglePdfSelection: (productId: string) => void
  isNewArrival?: boolean
}

function ProductCard({
  product,
  onAddToCart,
  isAdmin,
  isPdfMode,
  isSelectedForPdf,
  onTogglePdfSelection,
  isNewArrival,
}: ProductCardProps) {
  const [showUploadHint, setShowUploadHint] = useState(false)

  const handleClick = () => {
    if (isPdfMode) {
      onTogglePdfSelection(product.id)
    }
  }

  const handleUploadClick = () => {
    // In real app, this would open camera/gallery
    alert(`Upload photo for ${product.name}`)
  }

  return (
    <div
      onClick={handleClick}
      className={`relative bg-card rounded-2xl overflow-hidden border transition-all duration-300 ${
        isNewArrival
          ? "border-new-arrival/30 shadow-[0_4px_20px_rgba(200,150,50,0.12)]"
          : "border-border/60 hover:border-border"
      } ${isPdfMode ? "cursor-pointer active:scale-[0.98]" : ""} ${
        isSelectedForPdf ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-[0.98]" : ""
      }`}
    >
      {/* PDF Selection Checkbox */}
      {isPdfMode && (
        <div
          className={`absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
            isSelectedForPdf
              ? "bg-accent border-accent text-accent-foreground scale-110"
              : "bg-card/90 border-border/80 backdrop-blur-md"
          }`}
        >
          {isSelectedForPdf && <Check className="w-3 h-3" strokeWidth={3} />}
        </div>
      )}

      {/* Product Image Area */}
      <div
        className="relative aspect-square bg-secondary"
        onMouseEnter={() => isAdmin && setShowUploadHint(true)}
        onMouseLeave={() => setShowUploadHint(false)}
      >
        {product.image ? (
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/80">
            <ImageIcon className="w-10 h-10 mb-1.5 opacity-20" strokeWidth={1.25} />
            <span className="text-[10px] opacity-40 font-medium tracking-wide uppercase">No image</span>
          </div>
        )}

        {/* Admin Upload Overlay */}
        {isAdmin && !isPdfMode && (
          <button
            onClick={handleUploadClick}
            className={`absolute inset-0 bg-foreground/70 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200 ${
              showUploadHint || !product.image ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex flex-col items-center text-white">
              <Camera className="w-7 h-7 mb-1.5" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">
                {product.image ? "Change" : "Add Photo"}
              </span>
            </div>
          </button>
        )}

        {/* New Arrival Badge */}
        {isNewArrival && !isPdfMode && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-new-arrival/90 text-foreground text-[9px] font-bold rounded-lg tracking-widest shadow-md">
            NEW
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-0.5 tracking-tight">
          {product.name}
        </h3>
        <p className="text-[11px] text-muted-foreground/80 mb-3 font-medium">{product.brand}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-foreground tracking-tight">
              {product.stock}
            </span>
            <span className="text-[10px] text-muted-foreground/60 ml-1 font-semibold uppercase tracking-wide">Sets</span>
          </div>

          {!isPdfMode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(product)
              }}
              className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all duration-200 active:scale-90 shadow-sm"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {product.price && (
          <p className="text-[11px] text-accent font-semibold mt-2 tracking-wide">
            ₹{product.price}/set
          </p>
        )}
      </div>
    </div>
  )
}
