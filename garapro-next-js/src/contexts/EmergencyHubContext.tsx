"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// contexts/EmergencyHubContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  emergencyHubClient,
  EmergencyNotification,
} from "@/services/manager/emergencyHub";
import { branchService } from "../services/branch-service";
import { apiClient } from "@/services/api-client";

type UserProfile = {
  id: string;
  roles: string[];
  branchId?: string | null;
  fullName?: string;
  [k: string]: any;
};

type EmergencyHubContextValue = {
  connected: boolean;
  connectionId: string | null;
  profile: UserProfile | null;
  notifications: EmergencyNotification[];
  groups: string[];
  // helpers
  joinBranch?: (branchId: string) => Promise<void>;
  leaveBranch?: (branchId: string) => Promise<void>;
};

const EmergencyHubContext = createContext<EmergencyHubContextValue | undefined>(
  undefined
);

export function useEmergencyHubContext() {
  const ctx = useContext(EmergencyHubContext);
  if (!ctx)
    throw new Error(
      "useEmergencyHubContext must be used within EmergencyHubProvider"
    );
  return ctx;
}

export const EmergencyHubProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connected, setConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(
    []
  );
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    let handlersAttached = false;

    async function init() {
      // 1) Load profile (từ /api/me). Tùy project: next-auth, cookies, localStorage token, etc.
      try {
        const res = await apiClient.get("/api/me", { credentials: "include" });
        if (!res.success) {
          console.warn("Not authenticated or /api/me failed");
          return;
        }
        const pf = await res.json();
        if (!mounted) return;
        setProfile(pf);

        // 2) If not manager -> do nothing or still connect for other roles if needed
        const isManager = pf.roles?.some(
          (r: string) => r.toLowerCase() === "manager"
        );

        // 3) Start signalr connection with token if any
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") ?? undefined
            : undefined;
        try {
          await emergencyHubClient.start(token);
          if (!mounted) return;
          setConnected(true);
        } catch (startErr) {
          console.error("SignalR start error", startErr);
          return;
        }

        // 4) attach handlers once
        if (!handlersAttached) {
          handlersAttached = true;

          emergencyHubClient.on("Connected", (id: string) => {
            setConnectionId(id);
          });

          const onGroupChange = async () => {
            try {
              const g = await emergencyHubClient.getJoinedGroups();
              setGroups(g);
            } catch {}
          };
          emergencyHubClient.on("JoinedCustomerGroup", onGroupChange);
          emergencyHubClient.on("JoinedBranchGroup", onGroupChange);
          emergencyHubClient.on("LeftCustomerGroup", onGroupChange);
          emergencyHubClient.on("LeftBranchGroup", onGroupChange);

          emergencyHubClient.on(
            "EmergencyRequestCreated",
            (payload: EmergencyNotification) => {
              // push to state
              setNotifications((prev) => [payload, ...prev].slice(0, 100));
              // Optionally show browser notification
              if (typeof window !== "undefined" && "Notification" in window) {
                if (Notification.permission === "granted") {
                  new Notification(payload.Message ?? "Yêu cầu cứu hộ mới", {
                    body: payload.Address ?? "",
                  });
                } else if (Notification.permission !== "denied") {
                  Notification.requestPermission().then(
                    (perm) =>
                      perm === "granted" &&
                      new Notification(payload.Message ?? "Yêu cầu cứu hộ mới")
                  );
                }
              }
            }
          );
        }

        // 5) If this user is manager -> ensure join branch group
        if (isManager) {
          let branchId = pf.branchId ?? null;

          if (!branchId) {
            // try getting current user's branch via branchService
            try {
              const b = await branchService.getCurrentUserBranch(pf.id);
              if (b) branchId = b.branchId;
            } catch (err) {
              console.warn("branchService.getCurrentUserBranch failed", err);
            }
          }

          if (branchId) {
            try {
              await emergencyHubClient.joinBranchGroup(branchId);
              // update groups list
              const g = await emergencyHubClient.getJoinedGroups();
              if (mounted) setGroups(g);
            } catch (err) {
              console.error("Failed to join branch group", err);
            }
          } else {
            console.warn(
              "Manager but no branchId found. Consider providing branchId in /api/me or allow manager to select branch."
            );
          }
        }
      } catch (err) {
        console.error("EmergencyHubProvider init error", err);
      }
    }

    init();

    return () => {
      mounted = false;
      // don't stop connection here to keep singleton active across app,
      // but you could stop on logout explicitly.
    };
  }, []);

  const joinBranch = async (branchId: string) => {
    await emergencyHubClient.joinBranchGroup(branchId);
    const g = await emergencyHubClient.getJoinedGroups();
    setGroups(g);
  };

  const leaveBranch = async (branchId: string) => {
    await emergencyHubClient.leaveBranchGroup(branchId);
    const g = await emergencyHubClient.getJoinedGroups();
    setGroups(g);
  };

  const value = useMemo(
    () => ({
      connected,
      connectionId,
      profile,
      notifications,
      groups,
      joinBranch,
      leaveBranch,
    }),
    [connected, connectionId, profile, notifications, groups]
  );

  return (
    <EmergencyHubContext.Provider value={value}>
      {children}
    </EmergencyHubContext.Provider>
  );
};
