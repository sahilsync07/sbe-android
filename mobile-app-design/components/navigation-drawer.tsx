"use client"

import { X, ChevronRight, ChevronDown, Sparkles, Package } from "lucide-react"
import { useState } from "react"
import type { BrandCategory } from "./mobile-app"

type NavigationDrawerProps = {
  isOpen: boolean
  onClose: () => void
  categories: BrandCategory[]
  selectedBrand: string | null
  onSelectBrand: (brand: string) => void
  onClearFilter: () => void
}

export function NavigationDrawer({
  isOpen,
  onClose,
  categories,
  selectedBrand,
  onSelectBrand,
  onClearFilter,
}: NavigationDrawerProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Clubs"])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const getCategoryColor = (color?: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald"
      case "paragon-red":
        return "bg-paragon-red"
      default:
        return "bg-muted-foreground"
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-sidebar z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-sidebar-border/50">
            <div>
              <h2 className="text-xl font-black tracking-tight text-sidebar-foreground">Brands</h2>
              <p className="text-xs text-sidebar-foreground/50 tracking-wide uppercase mt-0.5">Browse by category</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl hover:bg-sidebar-accent/80 active:scale-95 transition-all duration-200 text-sidebar-foreground"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          {/* All Products Button */}
          <div className="p-4 border-b border-sidebar-border/50">
            <button
              onClick={onClearFilter}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                !selectedBrand
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : "bg-sidebar-accent/60 text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Sparkles className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span className="font-semibold text-sm tracking-wide">All Products</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto py-2">
            {categories.map((category) => (
              <div key={category.name} className="border-b border-sidebar-border/30 last:border-b-0">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-sidebar-accent/40 active:bg-sidebar-accent/60 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(category.color)}`}
                    />
                    <span className="font-semibold text-sm text-sidebar-foreground tracking-wide">
                      {category.name}
                    </span>
                  </div>
                  {expandedCategories.includes(category.name) ? (
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground/40" strokeWidth={2} />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-sidebar-foreground/40" strokeWidth={2} />
                  )}
                </button>

                {/* Sub-brands */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expandedCategories.includes(category.name)
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  {category.brands.map((brand) => (
                    <button
                      key={brand.name}
                      onClick={() => onSelectBrand(brand.name)}
                      className={`w-full flex items-center justify-between pl-11 pr-5 py-3 transition-all duration-200 ${
                        selectedBrand === brand.name
                          ? "bg-sidebar-primary/15 text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                      }`}
                    >
                      <span className="text-sm font-medium">{brand.name}</span>
                      <span className="text-[10px] text-sidebar-foreground/40 bg-sidebar-accent/50 px-2 py-1 rounded-lg font-semibold">
                        {brand.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-sidebar-border/30">
            <p className="text-[10px] text-sidebar-foreground/30 text-center font-medium tracking-widest uppercase">
              SBE Rayagada v2.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
