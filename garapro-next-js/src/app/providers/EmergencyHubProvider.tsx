/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  emergencyHubClient,
  EmergencyNotification,
} from "@/services/manager/emergencyHub";
import { branchService } from "@/services/branch-service";
import { apiClient } from "@/services/manager/api-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RequestToastContent from "@/components/RequestToastContent";

type UserProfile = {
  id: string;
  roles: string[];
  branchId?: string | null;
  fullName?: string;
};

type EmergencyHubContextState = {
  connected: boolean;
  profile: UserProfile | null;
  notifications: EmergencyNotification[];
  groups: string[];
};

const EmergencyHubContext = createContext<EmergencyHubContextState | undefined>(
  undefined
);

export function useEmergencyHub() {
  const ctx = useContext(EmergencyHubContext);
  if (!ctx)
    throw new Error("useEmergencyHub must be used inside EmergencyHubProvider");
  return ctx;
}

/** parseJwt, extractRolesFromClaims */
function parseJwt(token?: string | null) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    console.warn("parseJwt failed", e);
    return null;
  }
}

function extractRolesFromClaims(claims: any): string[] {
  if (!claims) return [];
  const possible = [
    claims.role,
    claims.roles,
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    claims["role"],
  ];
  for (const c of possible) {
    if (!c) continue;
    if (Array.isArray(c)) return c.map(String);
    if (typeof c === "string") {
      if (c.includes(",")) return c.split(",").map((s) => s.trim());
      if (c.includes(" ")) return c.split(" ").map((s) => s.trim());
      return [c];
    }
  }
  return [];
}

export default function EmergencyHubProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(
    []
  );
  const [groups, setGroups] = useState<string[]>([]);
  const router = useRouter();

  // Prevent duplicate initialization
  const isInitializedRef = useRef(false);
  const toastIdsRef = useRef<Map<string, string | number>>(new Map());

  useEffect(() => {
    // Prevent duplicate setup in StrictMode
    if (isInitializedRef.current) return;

    let mounted = true;
    isInitializedRef.current = true;

    // API action handlers
    const acceptRequest = async (id: string) => {
      try {
        const res = await apiClient.post(`/EmergencyRequest/approve/${id}`);
        if (res?.success) {
          toast.success("Request accepted");
          setNotifications((prev) =>
            prev.map((n) =>
              n.EmergencyRequestId === id ? { ...n, Status: "Accepted" } : n
            )
          );
        } else {
          throw new Error(res?.message ?? "Server error");
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Accept failed");
        throw err;
      }
    };

    const cancelRequest = async (id: string) => {
      try {
        const res = await apiClient.put(`/EmergencyRequest/reject/${id}`);
        if (res?.success) {
          toast.success("Request cancelled");
          setNotifications((prev) =>
            prev.map((n) =>
              n.EmergencyRequestId === id ? { ...n, Status: "Cancelled" } : n
            )
          );
        } else {
          throw new Error(res?.message ?? "Server error");
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Cancel failed");
        throw err;
      }
    };

    // Event handler for emergency requests
    const handleEmergencyRequest = (data: EmergencyNotification) => {
      if (!mounted) return;

      console.log("EVENT EmergencyRequestCreated", data);

      // Check if we already have a toast for this request
      const existingToastId = toastIdsRef.current.get(data.EmergencyRequestId);
      if (existingToastId) {
        console.log("Toast already exists for", data.EmergencyRequestId);
        return;
      }

      setNotifications((prev) => {
        // Prevent duplicate notifications
        const exists = prev.some(
          (n) => n.EmergencyRequestId === data.EmergencyRequestId
        );
        if (exists) return prev;
        return [data, ...prev];
      });

      // Create toast
      const toastId = toast.custom(
        (id) => (
          <RequestToastContent
            data={data}
            onAccept={async (reqId) => {
              try {
                await acceptRequest(reqId);
                toast.dismiss(id);
                toastIdsRef.current.delete(data.EmergencyRequestId);
              } catch {
                // Error already handled in acceptRequest
              }
            }}
            onCancel={async (reqId) => {
              try {
                await cancelRequest(reqId);
                toast.dismiss(id);
                toastIdsRef.current.delete(data.EmergencyRequestId);
              } catch {
                // Error already handled in cancelRequest
              }
            }}
            onView={() => {
              toast.dismiss(id);
              toastIdsRef.current.delete(data.EmergencyRequestId);
              router.push(`/manager/emergency`);
            }}
          />
        ),
        {
          duration: 20000,
          onDismiss: () => {
            toastIdsRef.current.delete(data.EmergencyRequestId);
          },
          onAutoClose: () => {
            toastIdsRef.current.delete(data.EmergencyRequestId);
          },
        }
      );

      // Store toast ID to prevent duplicates
      toastIdsRef.current.set(data.EmergencyRequestId, toastId);
    };

    // Update groups handler
    const updateGroups = async () => {
      if (!mounted) return;
      try {
        const g = await emergencyHubClient.getJoinedGroups();
        if (!mounted) return;
        setGroups(g);
      } catch (err) {
        console.warn("updateGroups failed", err);
      }
    };

    async function setup() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken") ?? undefined
            : undefined;

        const claims = parseJwt(token ?? null);
        const tokenUserId =
          claims?.sub ??
          claims?.nameid ??
          claims?.uid ??
          claims?.user_id ??
          null;

        const tokenRoles = extractRolesFromClaims(claims);

        // Get branch info
        let branchObj: any = null;
        try {
          const res = await apiClient.get("/Branch/my", {
            credentials: "include",
          });
          if (res && res.success) {
            branchObj = res.data;
            if (branchObj?.data) branchObj = branchObj.data;
          } else {
            branchObj = await branchService.getCurrentUserBranch(
              tokenUserId ?? ""
            );
          }
        } catch (err) {
          console.warn("Branch/my failed, fallback", err);
          try {
            branchObj = await branchService.getCurrentUserBranch(
              tokenUserId ?? ""
            );
          } catch (fallbackErr) {
            console.warn("Fallback branch fetch failed", fallbackErr);
          }
        }

        const pf: UserProfile = {
          id: String(tokenUserId ?? branchObj?.managerId ?? "") || "",
          roles: tokenRoles.length ? tokenRoles : [],
          branchId: branchObj?.branchId ?? null,
          fullName:
            claims?.name ??
            claims?.fullname ??
            branchObj?.branchName ??
            undefined,
        };

        if (!mounted) return;
        setProfile(pf);
        const isManager = pf.roles?.some((r) => r.toLowerCase() === "manager");
        console.log(
          "==========================================EmergencyHubProvider setup, isManager:",
          isManager
        );
        // Start SignalR
        if (!isManager) {
          console.log("User is NOT manager → skip SignalR connection");
          return;
        }

        // Start SignalR (manager only)
        try {
          await emergencyHubClient.start(token);
          if (!mounted) return;
          setConnected(true);
          console.log("SignalR connected (manager)");
        } catch (err) {
          console.error("SignalR start error", err);
          return;
        }

        // Register event handlers
        emergencyHubClient.on(
          "EmergencyRequestCreated",
          handleEmergencyRequest
        );
        emergencyHubClient.on("JoinedBranchGroup", updateGroups);
        emergencyHubClient.on("LeftBranchGroup", updateGroups);
        emergencyHubClient.on("JoinedCustomerGroup", updateGroups);
        emergencyHubClient.on("LeftCustomerGroup", updateGroups);

        // Auto join branch group if manager

        if (isManager) {
          let branchId = pf.branchId ?? null;
          if (!branchId && tokenUserId) {
            try {
              const b = await branchService.getCurrentUserBranch(tokenUserId);
              branchId = b?.branchId ?? null;
            } catch (err) {
              console.warn("Could not fetch branch for manager", err);
            }
          }
          if (branchId) {
            try {
              await emergencyHubClient.joinBranchGroup(branchId);
              await updateGroups();
              console.log("Joined branch group:", branchId);
            } catch (err) {
              console.error("joinBranchGroup failed", err);
            }
          } else {
            console.warn("Manager role detected but no branchId available");
          }
        } else {
          console.log("Not a manager, skipping branch group join");
        }

        await updateGroups();
      } catch (err) {
        console.error("Provider setup error", err);
      }
    }

    setup();

    // Cleanup function
    return () => {
      mounted = false;

      console.log("Cleaning up EmergencyHubProvider");

      // Remove all event handlers
      emergencyHubClient.off("EmergencyRequestCreated", handleEmergencyRequest);
      emergencyHubClient.off("JoinedBranchGroup", updateGroups);
      emergencyHubClient.off("LeftBranchGroup", updateGroups);
      emergencyHubClient.off("JoinedCustomerGroup", updateGroups);
      emergencyHubClient.off("LeftCustomerGroup", updateGroups);

      // Dismiss all active toasts
      toastIdsRef.current.forEach((toastId) => {
        toast.dismiss(toastId);
      });
      toastIdsRef.current.clear();

      // Optional: Stop SignalR connection if needed
      // emergencyHubClient.stop();
    };
  }, []); // Empty dependency array - only run once

  const value = useMemo(
    () => ({ connected, profile, notifications, groups }),
    [connected, profile, notifications, groups]
  );

  return (
    <EmergencyHubContext.Provider value={value}>
      {children}
    </EmergencyHubContext.Provider>
  );
}
