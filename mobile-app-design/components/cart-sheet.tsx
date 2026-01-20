"use client"

import { X, Minus, Plus, Trash2, ShoppingBag, Package } from "lucide-react"
import type { CartItem } from "./mobile-app"

type CartSheetProps = {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onSendOrder: () => void
}

export function CartSheet({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onSendOrder,
}: CartSheetProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
                <p className="text-sm text-muted-foreground">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Close cart"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium mb-1">Cart is empty</p>
                <p className="text-sm text-center">
                  Add products to your cart to place an order
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-card rounded-xl border border-border"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground opacity-30" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {item.brand}
                      </p>

                      {item.price && (
                        <p className="text-sm font-medium text-accent">
                          ₹{item.price * item.quantity}
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-card transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-card transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border bg-card space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-semibold">{totalItems} sets</span>
              </div>
              {totalValue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Value</span>
                  <span className="font-bold text-lg">₹{totalValue.toLocaleString()}</span>
                </div>
              )}

              {/* WhatsApp Button */}
              <button
                onClick={onSendOrder}
                className="w-full py-4 rounded-xl bg-whatsapp-green text-white font-semibold flex items-center justify-center gap-3 hover:bg-whatsapp-green/90 transition-colors active:scale-[0.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Send Order via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
