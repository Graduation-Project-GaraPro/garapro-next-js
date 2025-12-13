"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { branchService, type GarageBranch } from '@/services/branch-service';
import { UserService } from '@/services/manager/user-service';
import type { UserProfile } from '@/types/manager/user';

interface ManagerSessionContextType {
  userProfile: UserProfile | null;
  branch: GarageBranch | null;
  isLoading: boolean;
  error: string | null;
  getBranchId: () => string | null;
  refreshSession: () => Promise<void>;
}

const ManagerSessionContext = createContext<ManagerSessionContextType | undefined>(undefined);

export function ManagerSessionProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [branch, setBranch] = useState<GarageBranch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      loadSessionData(user.userId);
    } else {
      // Clear data if not authenticated
      setUserProfile(null);
      setBranch(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  const loadSessionData = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄Loading manager session data...');
      
      // Fetch user profile and branch data in parallel
      const [profileData, branchData] = await Promise.all([
        UserService.getCurrentUser().catch(err => {
          console.warn('Failed to fetch user profile:', err);
          return null;
        }),
        branchService.getCurrentUserBranch(userId).catch(err => {
          console.warn('Failed to fetch branch data:', err);
          return null;
        })
      ]);

      setUserProfile(profileData);
      setBranch(branchData);
      
      console.log('✅Manager session data loaded:', {
        profile: profileData?.fullName,
        branch: branchData?.branchName
      });
    } catch (err) {
      console.error('Failed to load manager session data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    if (user?.userId) {
      await loadSessionData(user.userId);
    }
  };

  const getBranchId = (): string | null => {
    return branch?.branchId || null;
  };

  const value: ManagerSessionContextType = {
    userProfile,
    branch,
    isLoading,
    error,
    getBranchId,
    refreshSession,
  };

  return (
    <ManagerSessionContext.Provider value={value}>
      {children}
    </ManagerSessionContext.Provider>
  );
}

export function useManagerSession() {
  const context = useContext(ManagerSessionContext);
  if (context === undefined) {
    throw new Error('useManagerSession must be used within a ManagerSessionProvider');
  }
  return context;
}