"use client";

import { useEffect, useState } from "react";
import { repairOrderHubService } from "../../services/manager/repair-order-hub";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MapPin, Wrench } from "lucide-react";

export default function LiveActivityFeed() {
  const [liveActivities, setLiveActivities] = useState<
    {
      id: string;
      action: string;
      timestamp: string;
      user: string;
      location: string;
      value: string;
      status: string;
    }[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    const setupConnection = async () => {
      await repairOrderHubService.initialize();

      // 🔔 Khi có order mới
      repairOrderHubService.onRepairOrderCreated((order) => {
        console.log("New repair order created via SignalR:", order);
        if (!isMounted) return;

        const newActivity = {
          id: order.repairOrderId,
          action: `New ${order.roTypeName || "Repair"} Order Created`,
          timestamp: new Date().toLocaleTimeString(),
          user:
            order.customerName?.trim() ||
            `Customer ${order.customerPhone || "Unknown"}`,
          location: `Branch ID: ${order.branchId?.slice(0, 8)}...`,
          value: `Est. ₫${order.estimatedAmount.toLocaleString()} • ${
            order.estimatedRepairTime
          }h`,
          status: "created",
        };

        setLiveActivities((prev) => [newActivity, ...prev].slice(0, 20));
      });
    };

    setupConnection();

    return () => {
      isMounted = false;
      repairOrderHubService.disconnect();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "created":
        return <Wrench className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Live Activity Feed</span>
        </CardTitle>
        <CardDescription>
          Real-time user activities and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {liveActivities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No recent activity
            </p>
          ) : (
            liveActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <span className="text-xs text-gray-400">
                      {activity.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">{activity.user}</p>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {activity.location}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.value}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
