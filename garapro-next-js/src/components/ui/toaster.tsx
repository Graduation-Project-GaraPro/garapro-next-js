"use client"

import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border px-4 py-3 shadow-md w-80 transition ${
            t.variant === "destructive"
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-gray-300 bg-white text-gray-800"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{t.title}</p>
              {t.description && (
                <p className="text-sm opacity-80">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id!)}
              className="ml-2 text-sm text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
