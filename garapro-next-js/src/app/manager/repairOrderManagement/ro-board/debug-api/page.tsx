"use client"

import { useState } from "react"

export default function DebugApiPage() {
  const [repairOrderId, setRepairOrderId] = useState("f884e517-4dd2-46bc-9abe-1da43f0b1632")
  const [statusId, setStatusId] = useState("d944cdf3-d3aa-403c-90cf-ded27d1ff66a")
  const [responseText, setResponseText] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApiCall = async () => {
    try {
      setLoading(true)
      setError(null)
      setResponseText("")
      
      console.log("Testing API call with:")
      console.log("Repair Order ID:", repairOrderId)
      console.log("Status ID:", statusId)
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7113"
      const url = `${baseUrl}/api/RepairOrder/status/update`
      
      console.log("Full URL:", url)
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repairOrderId: repairOrderId,
          newStatusId: statusId
        })
      })
      
      console.log("Response status:", response.status)
      console.log("Response headers:", [...response.headers.entries()])
      
      const text = await response.text()
      console.log("Response text:", text)
      
      if (!response.ok) {
        setError(`HTTP ${response.status}: ${text}`)
        return
      }
      
      setResponseText(text)
    } catch (err) {
      console.error("API test failed:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug API Call</h1>
      
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Repair Order ID</label>
            <input
              type="text"
              value={repairOrderId}
              onChange={(e) => setRepairOrderId(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status ID</label>
            <input
              type="text"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
        <button 
          onClick={testApiCall}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test API Call"}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {responseText && (
        <div className="p-4 border border-green-300 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-green-700">Response</h2>
          <pre className="whitespace-pre-wrap">{responseText}</pre>
        </div>
      )}
    </div>
  )
}