"use client"

import { useManagerSession } from '@/contexts/manager-session-context';

export function useUserProfile() {
  const { userProfile, isLoading, error, refreshSession } = useManagerSession();
  
  return {
    user: userProfile,
    loading: isLoading,
    error,
    refetch: refreshSession
  };
}