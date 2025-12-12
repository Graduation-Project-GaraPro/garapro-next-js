"use client"

import { useState, useEffect } from 'react'
import { UserService } from '@/services/manager/user-service'
import type { UserProfile } from '@/types/manager/user'

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const userData = await UserService.getCurrentUser()
        setUser(userData)
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const refetch = async () => {
    try {
      setError(null)
      const userData = await UserService.getCurrentUser()
      setUser(userData)
    } catch (err) {
      console.error('Failed to refetch user profile:', err)
      setError('Failed to load user profile')
    }
  }

  return {
    user,
    loading,
    error,
    refetch
  }
}