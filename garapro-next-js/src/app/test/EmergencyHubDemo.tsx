"use client";

// components/EmergencyHubDemo.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  emergencyHubClient,
  EmergencyNotification,
} from "../../services/manager/emergencyHub";

async function getAccessToken(): Promise<string | undefined> {
  return typeof window !== "undefined"
    ? localStorage.getItem("accessToken") ?? undefined
    : undefined;
}

// helper để hiển thị Browser Notification nếu có quyền
async function showBrowserNotification(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission();
    if (perm === "granted") new Notification(title, { body });
  }
}

export default function EmergencyHubDemo() {
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("Disconnected");
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(
    []
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      const token = await getAccessToken();
      try {
        await emergencyHubClient.start(token);
      } catch (err) {
        console.error("Could not start hub", err);
        return;
      }

      if (!mounted) return;
      setStatus(emergencyHubClient.connectionState());

      const onConnected = (connectionId: string) => {
        setConnectedId(connectionId);
        console.log("Connected with id:", connectionId);
      };

      const onGroupChange = async () => {
        try {
          const g = await emergencyHubClient.getJoinedGroups();
          if (mounted) setGroups(g);
        } catch {
          // ignore
        }
      };

      // Handler cho event EmergencyRequestCreated
      const onEmergencyRequestCreated = (payload: EmergencyNotification) => {
        console.log("EmergencyRequestCreated", payload);
        setNotifications((prev) => [payload, ...prev].slice(0, 50)); // keep recent 50
        // show browser notification (tùy permission)
        showBrowserNotification(
          "Yêu cầu cứu hộ mới",
          payload.Message ?? "Có yêu cầu cứu hộ mới"
        );
      };

      emergencyHubClient.on("Connected", onConnected);
      emergencyHubClient.on("JoinedCustomerGroup", onGroupChange);
      emergencyHubClient.on("JoinedBranchGroup", onGroupChange);
      emergencyHubClient.on("LeftCustomerGroup", onGroupChange);
      emergencyHubClient.on("LeftBranchGroup", onGroupChange);
      emergencyHubClient.on(
        "EmergencyRequestCreated",
        onEmergencyRequestCreated
      );

      // initial groups
      try {
        const g = await emergencyHubClient.getJoinedGroups();
        if (mounted) setGroups(g);
      } catch (err) {
        console.warn("Could not fetch groups", err);
      }

      return () => {
        mounted = false;
        emergencyHubClient.off("Connected", onConnected);
        emergencyHubClient.off("JoinedCustomerGroup", onGroupChange);
        emergencyHubClient.off("JoinedBranchGroup", onGroupChange);
        emergencyHubClient.off("LeftCustomerGroup", onGroupChange);
        emergencyHubClient.off("LeftBranchGroup", onGroupChange);
        emergencyHubClient.off(
          "EmergencyRequestCreated",
          onEmergencyRequestCreated
        );
        // don't stop connection here to keep single connection across app; stop() if you want.
      };
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoinCustomer = useCallback(async () => {
    const customerId = prompt("CustomerId to join (e.g. 123)") ?? "";
    if (!customerId) return;
    await emergencyHubClient.joinCustomerGroup(customerId);
    const g = await emergencyHubClient.getJoinedGroups();
    setGroups(g);
  }, []);

  const handleLeaveCustomer = useCallback(async () => {
    const customerId = prompt("CustomerId to leave") ?? "";
    if (!customerId) return;
    await emergencyHubClient.leaveCustomerGroup(customerId);
    const g = await emergencyHubClient.getJoinedGroups();
    setGroups(g);
  }, []);

  return (
    <div>
      <h3>Emergency Hub Demo</h3>
      <p>Connection status: {status}</p>
      <p>Connection id (server): {connectedId ?? "—"}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={handleJoinCustomer}>Join Customer Group</button>
        <button onClick={handleLeaveCustomer}>Leave Customer Group</button>
        <button
          onClick={async () => {
            const token = await getAccessToken();
            await emergencyHubClient.stop();
            await emergencyHubClient.start(token);
            setStatus(emergencyHubClient.connectionState());
          }}
        >
          Restart Connection (refresh token)
        </button>
      </div>

      <h4>Groups joined</h4>
      <ul>
        {groups.length === 0 ? (
          <li>none</li>
        ) : (
          groups.map((g) => <li key={g}>{g}</li>)
        )}
      </ul>

      <h4>Mới nhận (Recent notifications)</h4>
      {notifications.length === 0 ? (
        <p>Chưa có thông báo</p>
      ) : (
        <div
          style={{
            maxHeight: 320,
            overflow: "auto",
            border: "1px solid #ddd",
            padding: 8,
          }}
        >
          {notifications.map((n) => (
            <div
              key={n.EmergencyRequestId + String(n.Timestamp)}
              style={{ padding: 8, borderBottom: "1px solid #eee" }}
            >
              <strong>{n.Message ?? "Yêu cầu cứu hộ"}</strong>
              <div style={{ fontSize: 13, color: "#444" }}>
                ID: {n.EmergencyRequestId} — Trạng thái: {n.Status}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Khách hàng: {n.CustomerName} ({n.CustomerPhone}) — Địa chỉ:{" "}
                {n.Address}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Khoảng cách: {n.DistanceToGarageKm ?? "—"} km — ETA:{" "}
                {n.EstimatedArrivalMinutes ?? "—"} phút
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
