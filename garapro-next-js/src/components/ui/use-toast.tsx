"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ToastVariant = "default" | "destructive"

export type ToastOptions = {
  id?: number
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastContextType = {
  toasts: ToastOptions[]
  addToast: (t: ToastOptions) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let listeners: ((t: ToastOptions) => void)[] = []
let toastId = 0

// ===== Hàm toast gọi toàn cục =====
export function toast(t: Omit<ToastOptions, "id">) {
  const id = ++toastId
  listeners.forEach((l) => l({ ...t, id }))
  return id
}

// ===== Provider để wrap app =====
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastOptions[]>([])

  const addToast = (t: ToastOptions) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => dismiss(t.id!), 3000) // auto-hide sau 3s
  }

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    const listener = (t: ToastOptions) => addToast(t)
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}
