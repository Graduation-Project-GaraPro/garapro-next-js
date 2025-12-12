"use client";

import { useState, useEffect } from 'react';
import { branchService, type GarageBranch } from '@/services/branch-service';

export function useCurrentBranch() {
  const [branch, setBranch] = useState<GarageBranch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentBranch = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentBranch = await branchService.getCurrentUserBranch('');
        setBranch(currentBranch);
      } catch (err) {
        console.error('Failed to fetch current branch:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch branch');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBranch();
  }, []);

  return { branch, loading, error };
}