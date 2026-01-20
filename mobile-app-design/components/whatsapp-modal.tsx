"use client"

import { X, Send, User, Phone } from "lucide-react"
import { useState } from "react"
import type { CartItem } from "./mobile-app"

type WhatsAppModalProps = {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onClearCart: () => void
}

export function WhatsAppModal({
  isOpen,
  onClose,
  cart,
  onClearCart,
}: WhatsAppModalProps) {
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {}
    
    if (!customerName.trim()) {
      newErrors.name = "Please enter customer name"
    }
    
    if (!phoneNumber.trim()) {
      newErrors.phone = "Please enter phone number"
    } else if (!/^[0-9]{10}$/.test(phoneNumber.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateOrderMessage = () => {
    const orderLines = cart.map(
      (item) => `• ${item.name} (${item.brand}) - ${item.quantity} sets`
    )
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = cart.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    )

    let message = `*New Order from SBE Rayagada*\n\n`
    message += `*Customer:* ${customerName}\n`
    message += `*Phone:* ${phoneNumber}\n\n`
    message += `*Order Details:*\n${orderLines.join("\n")}\n\n`
    message += `*Total:* ${totalItems} sets`
    if (totalValue > 0) {
      message += ` (Est. ₹${totalValue.toLocaleString()})`
    }

    return encodeURIComponent(message)
  }

  const handleSend = () => {
    if (!validateForm()) return

    const message = generateOrderMessage()
    const whatsappUrl = `https://wa.me/?text=${message}`
    
    window.open(whatsappUrl, "_blank")
    
    // Clear form and cart
    setCustomerName("")
    setPhoneNumber("")
    onClearCart()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-whatsapp-green flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                className="w-5 h-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-foreground">Send Order</h3>
              <p className="text-sm text-muted-foreground">via WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Customer Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className={`w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.name ? "ring-2 ring-destructive" : ""
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit number"
                className={`w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.phone ? "ring-2 ring-destructive" : ""
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-secondary/50 rounded-xl p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Order Summary</h4>
            <div className="space-y-1">
              {cart.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {item.name}
                  </span>
                  <span className="font-medium">{item.quantity} sets</span>
                </div>
              ))}
              {cart.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{cart.length - 3} more items
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSend}
            className="w-full py-4 rounded-xl bg-whatsapp-green text-white font-semibold flex items-center justify-center gap-3 hover:bg-whatsapp-green/90 transition-colors active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            Send to WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
