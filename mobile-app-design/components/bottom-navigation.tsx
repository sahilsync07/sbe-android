"use client"

import { Home, Layers, User, FileText } from "lucide-react"

type BottomNavigationProps = {
  activeTab: "home" | "brands" | "profile" | "pdf"
  onTabChange: (tab: "home" | "brands" | "profile" | "pdf") => void
  onBrandsClick: () => void
  isAdmin?: boolean
  isPdfMode?: boolean
  onPdfModeToggle?: () => void
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  onBrandsClick,
  isAdmin = false,
  isPdfMode = false,
  onPdfModeToggle,
}: BottomNavigationProps) {
  const baseTabs = [
    {
      id: "home" as const,
      label: "Home",
      icon: Home,
      onClick: () => onTabChange("home"),
    },
    {
      id: "brands" as const,
      label: "Brands",
      icon: Layers,
      onClick: onBrandsClick,
    },
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      onClick: () => onTabChange("profile"),
    },
  ]

  // Add PDF tab only in admin mode
  const tabs = isAdmin
    ? [
        ...baseTabs.slice(0, 2),
        {
          id: "pdf" as const,
          label: "Catalog",
          icon: FileText,
          onClick: onPdfModeToggle || (() => onTabChange("pdf")),
          isSpecial: true,
        },
        baseTabs[2],
      ]
    : baseTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/95 backdrop-blur-xl border-t border-border/50 z-40">
      <div className="flex items-center justify-around py-2.5 px-4 safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === "pdf" ? isPdfMode : activeTab === tab.id
          const isSpecial = "isSpecial" in tab && tab.isSpecial

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center py-2 px-5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? isSpecial
                    ? "bg-accent/15 text-accent"
                    : "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? "scale-110" : ""
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span
                className={`text-[10px] mt-1.5 font-semibold tracking-wide uppercase ${
                  isActive ? "" : "opacity-70"
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
