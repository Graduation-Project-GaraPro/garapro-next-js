"use client";

import { useManagerSession } from '@/contexts/manager-session-context';

export function useCurrentBranch() {
  const { branch, isLoading, error } = useManagerSession();
  
  return {
    branch,
    loading: isLoading,
    error
  };
}