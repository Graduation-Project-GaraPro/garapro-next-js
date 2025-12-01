"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useEmergencyHub.tsx
import { useEffect, useState, useCallback } from "react";
import {
  emergencyHubClient,
  EmergencyNotification,
} from "@/services/manager/emergencyHub";

/**
 * Expected /api/me response:
 * { id: string, roles: string[], branchId?: string | null, name?: string, phone?: string }
 */
type UserProfile = {
  id: string;
  roles: string[];
  branchId?: string | null;
  [k: string]: any;
};

export function useEmergencyHub() {
  const [connected, setConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(
    []
  );
  const [groups, setGroups] = useState<string[]>([]);

  // fetch profile from your backend. Adjust path if different.
  const fetchProfile = useCallback(async (opts?: { token?: string }) => {
    try {
      const res = await fetch("/api/me", {
        headers: {
          "Content-Type": "application/json",
          // If your API expects token explicitly, add: Authorization: `Bearer ${token}`
        },
        credentials: "include", // if using cookies
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setProfile(data);
      return data as UserProfile;
    } catch (err) {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let onEmergencyHandler: ((payload: EmergencyNotification) => void) | null =
      null;
    let onConnectedHandler: ((id: string) => void) | null = null;
    let onGroupHandler: (() => void) | null = null;

    (async () => {
      // 1) get JWT token if you store in localStorage / cookies
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ?? undefined
          : undefined;

      // 2) fetch profile
      const pf = await fetchProfile();
      if (!mounted) return;

      // 3) start signalr connection with token
      try {
        await emergencyHubClient.start(token);
      } catch (err) {
        console.error("SignalR start failed", err);
        return;
      }

      setConnected(true);

      // handlers
      onConnectedHandler = (id: string) => {
        setConnectionId(id);
      };

      onGroupHandler = async () => {
        try {
          const g = await emergencyHubClient.getJoinedGroups();
          setGroups(g);
        } catch {
          // ignore
        }
      };

      onEmergencyHandler = (payload: EmergencyNotification) => {
        setNotifications((prev) => [payload, ...prev].slice(0, 50));
        // optional: browser notification
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(payload.Message ?? "Yêu cầu cứu hộ mới", {
              body: payload.Address ?? "",
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((perm) => {
              if (perm === "granted")
                new Notification(payload.Message ?? "Yêu cầu cứu hộ mới");
            });
          }
        }
      };

      emergencyHubClient.on("Connected", onConnectedHandler);
      emergencyHubClient.on("JoinedCustomerGroup", onGroupHandler);
      emergencyHubClient.on("JoinedBranchGroup", onGroupHandler);
      emergencyHubClient.on("LeftCustomerGroup", onGroupHandler);
      emergencyHubClient.on("LeftBranchGroup", onGroupHandler);
      emergencyHubClient.on("EmergencyRequestCreated", onEmergencyHandler);

      // 4) ensure manager joins branch group
      // Option A: If server will auto-add (via IUserRepository in OnConnectedAsync), nothing extra needed.
      // Option B: If server cannot determine branch from claims, instruct client to explicitly join:
      if (pf) {
        const isManager = pf.roles?.some(
          (r: string) => r.toLowerCase() === "manager"
        );
        if (isManager) {
          const branchId = pf.branchId;
          if (branchId) {
            try {
              await emergencyHubClient.joinBranchGroup(branchId);
              const g = await emergencyHubClient.getJoinedGroups();
              setGroups(g);
            } catch (err) {
              console.error("joinBranchGroup failed", err);
            }
          } else {
            // If profile doesn't carry branchId but server can find it by user id in OnConnectedAsync,
            // you can skip. Otherwise you might call an API to resolve branch then join.
            console.warn(
              "Manager but no branchId in profile. Ensure server can resolve branch by userId or provide branchId in profile."
            );
          }
        }
      }

      // initial groups fetch
      try {
        const g = await emergencyHubClient.getJoinedGroups();
        setGroups(g);
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
      if (onConnectedHandler)
        emergencyHubClient.off("Connected", onConnectedHandler);
      if (onGroupHandler) {
        emergencyHubClient.off("JoinedCustomerGroup", onGroupHandler);
        emergencyHubClient.off("JoinedBranchGroup", onGroupHandler);
        emergencyHubClient.off("LeftCustomerGroup", onGroupHandler);
        emergencyHubClient.off("LeftBranchGroup", onGroupHandler);
      }
      if (onEmergencyHandler)
        emergencyHubClient.off("EmergencyRequestCreated", onEmergencyHandler);
      // do not stop connection here to keep global singleton. If you want to stop on unmount, call emergencyHubClient.stop()
    };
  }, [fetchProfile]);

  // expose helpers to manually join/leave groups
  const joinBranch = useCallback(async (branchId: string) => {
    try {
      await emergencyHubClient.joinBranchGroup(branchId);
      const g = await emergencyHubClient.getJoinedGroups();
      setGroups(g);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const leaveBranch = useCallback(async (branchId: string) => {
    try {
      await emergencyHubClient.leaveBranchGroup(branchId);
      const g = await emergencyHubClient.getJoinedGroups();
      setGroups(g);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    connected,
    connectionId,
    profile,
    notifications,
    groups,
    joinBranch,
    leaveBranch,
    emergencyHubClient, // if you need direct access
  };
}
