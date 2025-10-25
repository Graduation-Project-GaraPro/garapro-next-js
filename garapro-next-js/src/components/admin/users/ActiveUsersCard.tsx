"use client";

import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

export default function ActiveUsersCard() {
  const [userCount, setUserCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);
  const [trend, setTrend] = useState([0]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5117/api/onlineuserhub")
      .withAutomaticReconnect()
      .build();

    connection.on("UserCountUpdated", (count) => {
      setPrevCount(userCount);
      setUserCount(count);
      setTrend((prev) => [...prev.slice(-4), count]); // giữ 5 giá trị gần nhất
    });

    connection
      .start()
      .then(async () => {
        setConnected(true);
        const count = await connection.invoke("GetOnlineUserCount");
        setUserCount(count);
        setTrend([count]);
      })
      .catch((err) => console.error("SignalR error:", err));

    return () => connection.stop();
  }, []);

  // 🔢 Tính toán thay đổi
  const change = userCount - prevCount;
  const changeType =
    change > 0 ? "positive" : change < 0 ? "negative" : "neutral";

  // 🎨 Dữ liệu metric hiển thị
  const metric = {
    id: "activeUsers",
    title: "Active Users",
    value: userCount,
    isLive: connected,
    change:
      changeType === "positive"
        ? `+${change}`
        : changeType === "negative"
        ? `${change}`
        : "0",
    changeType,
    bgColor: "bg-blue-50",
    color: "text-blue-600",
    icon: Users,
    trend,
  };

  return (
    <Card key={metric.id} className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <div className="flex items-center space-x-2">
          {metric.isLive && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          <div className={`p-2 rounded-full ${metric.bgColor}`}>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className="flex items-center space-x-2 mt-2">
          <span
            className={`text-sm font-medium ${
              metric.changeType === "positive"
                ? "text-green-600"
                : metric.changeType === "negative"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {metric.change}
          </span>
          <span className="text-sm text-gray-500">since last update</span>
        </div>

        <div className="mt-4">
          <Progress
            value={metric.trend[metric.trend.length - 1] * 10}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
