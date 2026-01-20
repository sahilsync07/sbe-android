"use client"

import { Menu, ShoppingBag, Search, RefreshCw, ShieldCheck } from "lucide-react"

type HeaderProps = {
  onMenuClick: () => void
  onCartClick: () => void
  cartItemCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  isAdmin: boolean
  onAdminToggle: () => void
  onSync: () => void
  isSyncing: boolean
}

export function Header({
  onMenuClick,
  onCartClick,
  cartItemCount,
  searchQuery,
  onSearchChange,
  isAdmin,
  onAdminToggle,
  onSync,
  isSyncing,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-4 py-3.5">
        <button
          onClick={onMenuClick}
          className="p-2.5 -ml-2 rounded-2xl hover:bg-sidebar-accent/80 active:scale-95 transition-all duration-200"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-tighter">SBE</span>
          <span className="text-xs font-medium text-sidebar-foreground/60 tracking-widest uppercase">Rayagada</span>
        </div>

        <div className="flex items-center gap-0.5">
          {isAdmin && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-2.5 rounded-2xl hover:bg-sidebar-accent/80 active:scale-95 transition-all duration-200 disabled:opacity-50"
              aria-label="Sync data"
            >
              <RefreshCw className={`w-[18px] h-[18px] ${isSyncing ? "animate-spin" : ""}`} strokeWidth={1.75} />
            </button>
          )}
          <button
            onClick={onCartClick}
            className="p-2.5 rounded-2xl hover:bg-sidebar-accent/80 active:scale-95 transition-all duration-200 relative"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
            {cartItemCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-emerald text-[10px] font-bold rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald/30">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-sidebar-foreground/40" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-sidebar-accent/60 rounded-2xl text-sidebar-foreground placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-2 focus:ring-sidebar-primary/50 focus:bg-sidebar-accent text-sm font-medium transition-all duration-200"
          />
        </div>
      </div>

      {/* Admin Toggle - Subtle placement */}
      <button
        onClick={onAdminToggle}
        className={`absolute bottom-4 right-4 p-2 rounded-xl transition-all duration-300 ${
          isAdmin 
            ? "bg-emerald/20 text-emerald ring-1 ring-emerald/30" 
            : "bg-sidebar-accent/30 text-sidebar-foreground/20 hover:text-sidebar-foreground/40"
        }`}
        aria-label="Toggle admin mode"
      >
        <ShieldCheck className="w-4 h-4" strokeWidth={isAdmin ? 2 : 1.5} />
      </button>
    </header>
  )
}
