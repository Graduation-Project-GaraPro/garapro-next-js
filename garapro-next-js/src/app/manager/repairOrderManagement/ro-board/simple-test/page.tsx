"use client"

import { useState, useEffect } from "react"

export default function SimpleTestPage() {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log("Testing API call to /api/OrderStatus/columns")
        const response = await fetch("https://localhost:7113/api/OrderStatus/columns")
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log("API response:", result)
        setData(result)
      } catch (err) {
        console.error("API test failed:", err)
        setError(err instanceof Error ? err.message : 'Failed to test API')
      } finally {
        setLoading(false)
      }
    }

    testApi()
  }, [])

  if (loading) {
    return <div className="p-4">Testing API call...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Test Results</h2>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}