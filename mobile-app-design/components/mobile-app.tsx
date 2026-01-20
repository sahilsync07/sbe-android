"use client"

import { useState } from "react"
import { Header } from "./header"
import { NavigationDrawer } from "./navigation-drawer"
import { ProductGrid } from "./product-grid"
import { CartSheet } from "./cart-sheet"
import { BottomNavigation } from "./bottom-navigation"
import { WhatsAppModal } from "./whatsapp-modal"
import { PdfSelectionMode } from "./pdf-selection-mode"

export type Product = {
  id: string
  name: string
  stock: number
  image?: string
  brand: string
  category: string
  isNewArrival?: boolean
  price?: number
}

export type CartItem = Product & {
  quantity: number
}

export type BrandCategory = {
  name: string
  color?: string
  brands: { name: string; count: number }[]
}

const brandCategories: BrandCategory[] = [
  {
    name: "Clubs",
    color: "emerald",
    brands: [
      { name: "Bansal Club", count: 45 },
      { name: "Airson Club", count: 32 },
      { name: "Kohinoor Club", count: 28 },
      { name: "Naresh Club", count: 19 },
    ],
  },
  {
    name: "Paragon",
    color: "paragon-red",
    brands: [
      { name: "Paragon Elite", count: 56 },
      { name: "Paragon Classic", count: 42 },
      { name: "Paragon Sport", count: 38 },
    ],
  },
  {
    name: "Top Brands",
    brands: [
      { name: "Nike Wholesale", count: 67 },
      { name: "Adidas Bulk", count: 54 },
      { name: "Puma Stock", count: 41 },
    ],
  },
  {
    name: "Mid Brands",
    brands: [
      { name: "Campus", count: 38 },
      { name: "Sparx", count: 45 },
      { name: "Relaxo", count: 52 },
    ],
  },
  {
    name: "Socks",
    brands: [
      { name: "Cotton Socks", count: 120 },
      { name: "Sports Socks", count: 85 },
      { name: "Ankle Socks", count: 92 },
    ],
  },
  {
    name: "General",
    brands: [
      { name: "Local Brands", count: 156 },
      { name: "Imported", count: 78 },
    ],
  },
]

const sampleProducts: Product[] = [
  { id: "1", name: "Sport Runner Pro", stock: 120, brand: "Bansal Club", category: "Clubs", isNewArrival: true, price: 450, image: "/products/sport-runner.jpg" },
  { id: "2", name: "Classic Leather", stock: 85, brand: "Paragon Elite", category: "Paragon", isNewArrival: true, price: 680, image: "/products/classic-leather.jpg" },
  { id: "3", name: "Urban Comfort", stock: 200, brand: "Airson Club", category: "Clubs", isNewArrival: true, price: 520, image: "/products/urban-comfort.jpg" },
  { id: "4", name: "Air Max Bulk", stock: 45, brand: "Nike Wholesale", category: "Top Brands", price: 1200 },
  { id: "5", name: "Ultra Boost Stock", stock: 67, brand: "Adidas Bulk", category: "Top Brands", price: 1100 },
  { id: "6", name: "Slide Comfort", stock: 150, brand: "Relaxo", category: "Mid Brands", price: 280, image: "/products/slide-comfort.jpg" },
  { id: "7", name: "Campus Runner", stock: 92, brand: "Campus", category: "Mid Brands", price: 650, image: "/products/campus-runner.jpg" },
  { id: "8", name: "Sport Elite", stock: 78, brand: "Sparx", category: "Mid Brands", price: 580 },
  { id: "9", name: "Cotton Premium", stock: 320, brand: "Cotton Socks", category: "Socks", price: 120, image: "/products/cotton-socks.jpg" },
  { id: "10", name: "Ankle Sport Pack", stock: 250, brand: "Sports Socks", category: "Socks", price: 150 },
  { id: "11", name: "Formal Oxford", stock: 56, brand: "Kohinoor Club", category: "Clubs", price: 890 },
  { id: "12", name: "Casual Sneaker", stock: 134, brand: "Local Brands", category: "General", price: 380 },
]

export function MobileApp() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showImagesOnly, setShowImagesOnly] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "brands" | "profile" | "pdf">("home")
  const [isPdfMode, setIsPdfMode] = useState(false)
  const [selectedForPdf, setSelectedForPdf] = useState<string[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  const filteredProducts = sampleProducts.filter((product) => {
    const matchesBrand = !selectedBrand || product.brand === selectedBrand
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesImageFilter = !showImagesOnly || product.image
    return matchesBrand && matchesSearch && matchesImageFilter
  })

  const newArrivals = filteredProducts.filter((p) => p.isNewArrival)
  const regularProducts = filteredProducts.filter((p) => !p.isNewArrival)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSyncing(false)
  }

  const togglePdfSelection = (productId: string) => {
    setSelectedForPdf((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handleGeneratePdf = () => {
    // In real app, this would generate PDF
    alert(`Generating PDF with ${selectedForPdf.length} items`)
    setIsPdfMode(false)
    setSelectedForPdf([])
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto relative overflow-hidden border-x border-border">
      <Header
        onMenuClick={() => setIsDrawerOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        cartItemCount={cartItemCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
        onAdminToggle={() => setIsAdmin(!isAdmin)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={brandCategories}
        selectedBrand={selectedBrand}
        onSelectBrand={(brand) => {
          setSelectedBrand(brand)
          setIsDrawerOpen(false)
        }}
        onClearFilter={() => {
          setSelectedBrand(null)
          setIsDrawerOpen(false)
        }}
      />

      <main className="flex-1 overflow-y-auto pb-20">
        {isPdfMode && (
          <PdfSelectionMode
            selectedCount={selectedForPdf.length}
            onCancel={() => {
              setIsPdfMode(false)
              setSelectedForPdf([])
            }}
            onGenerate={handleGeneratePdf}
          />
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Images Only</label>
              <button
                onClick={() => setShowImagesOnly(!showImagesOnly)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showImagesOnly ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-card transition-transform ${
                    showImagesOnly ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
            {selectedBrand && (
              <button
                onClick={() => setSelectedBrand(null)}
                className="text-sm text-accent font-medium"
              >
                Clear: {selectedBrand}
              </button>
            )}
          </div>

          {newArrivals.length > 0 && (
            <section className="mb-6">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-new-arrival/20 via-accent/20 to-emerald/20 rounded-lg blur-sm" />
                <h2 className="relative text-lg font-semibold text-foreground px-3 py-2 bg-gradient-to-r from-new-arrival/10 to-transparent rounded-lg border border-new-arrival/30">
                  New Arrivals
                </h2>
              </div>
              <ProductGrid
                products={newArrivals}
                onAddToCart={addToCart}
                isAdmin={isAdmin}
                isPdfMode={isPdfMode}
                selectedForPdf={selectedForPdf}
                onTogglePdfSelection={togglePdfSelection}
                isNewArrival
              />
            </section>
          )}

          {regularProducts.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                All Products
              </h2>
              <ProductGrid
                products={regularProducts}
                onAddToCart={addToCart}
                isAdmin={isAdmin}
                isPdfMode={isPdfMode}
                selectedForPdf={selectedForPdf}
                onTogglePdfSelection={togglePdfSelection}
              />
            </section>
          )}
        </div>
      </main>

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onSendOrder={() => {
          setIsCartOpen(false)
          setIsWhatsAppModalOpen(true)
        }}
      />

      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        cart={cart}
        onClearCart={() => setCart([])}
      />

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBrandsClick={() => setIsDrawerOpen(true)}
        isAdmin={isAdmin}
        isPdfMode={isPdfMode}
        onPdfModeToggle={() => setIsPdfMode(!isPdfMode)}
      />
    </div>
  )
}
