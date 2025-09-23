"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Clock, AlertTriangle } from "lucide-react";

interface Repair {
  id: number | string;
  licensePlate: string;
  vehicle: string;
  issue: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  date: string;
  priority: "high" | "medium" | "low";
  progress: number;
}

interface RepairListProps {
  searchTerm: string;
  statusFilter: string;
}

export function RepairList({ searchTerm, statusFilter }: RepairListProps) {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data - in reality would call API
    const mockData: Repair[] = [
      {
        id: 1,
        licensePlate: "51F-123.45",
        vehicle: "Toyota Camry 2020",
        issue: "Oil change and routine maintenance",
        status: "completed",
        date: "15/05/2023",
        priority: "medium",
        progress: 100,
      },
      {
        id: 2,
        licensePlate: "59A-678.90",
        vehicle: "Honda Civic 2019",
        issue: "Brake system inspection",
        status: "in-progress",
        date: "20/05/2023",
        priority: "high",
        progress: 60,
      },
      {
        id: 3,
        licensePlate: "51G-246.80",
        vehicle: "Ford Ranger 2021",
        issue: "Clutch replacement",
        status: "pending",
        date: "25/05/2023",
        priority: "medium",
        progress: 0,
      },
      {
        id: 4,
        licensePlate: "50D-357.91",
        vehicle: "Mazda CX-5 2022",
        issue: "Air conditioning repair",
        status: "pending",
        date: "28/05/2023",
        priority: "low",
        progress: 0,
      },
    ];

    setTimeout(() => {
      setRepairs(mockData);
      setLoading(false);
    }, 500);
  }, []);

  // Filter data by search and status
  const filteredRepairs = repairs.filter((repair) => {
    const matchesSearch = repair.licensePlate
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || repair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Display status
  const getStatusBadge = (status: Repair["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Wrench className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Display priority
  const getPriorityBadge = (priority: Repair["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredRepairs.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No requests found
        </h2>
        <p className="text-gray-600 mb-4">
          No repair requests match your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              License Plate
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Vehicle
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Issue
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Priority
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Progress
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredRepairs.map((repair) => (
            <tr key={repair.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {repair.licensePlate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {repair.vehicle}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {repair.issue}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getStatusBadge(repair.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {repair.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getPriorityBadge(repair.priority)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${repair.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs">{repair.progress}%</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/customer/repairs/${repair.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}