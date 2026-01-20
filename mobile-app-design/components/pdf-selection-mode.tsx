"use client"

import { FileText, X } from "lucide-react"

type PdfSelectionModeProps = {
  selectedCount: number
  onCancel: () => void
  onGenerate: () => void
}

export function PdfSelectionMode({
  selectedCount,
  onCancel,
  onGenerate,
}: PdfSelectionModeProps) {
  return (
    <div className="sticky top-0 z-30 bg-accent text-accent-foreground">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" />
          <div>
            <p className="font-semibold text-sm">PDF Catalog Mode</p>
            <p className="text-xs opacity-80">
              {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-accent-foreground/10 transition-colors"
            aria-label="Cancel selection"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onGenerate}
            disabled={selectedCount === 0}
            className="px-4 py-2 bg-card text-foreground rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card/90 transition-colors"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  )
}
