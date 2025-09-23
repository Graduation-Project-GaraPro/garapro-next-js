"use client";

import { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Filter, Download, Eye, Calendar, Car, Wrench, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { RepairStatusBadge } from '@/components/customer/common/StatusBadges';

interface RepairHistory {
  id: number | string;
  vehicle: string;
  licensePlate: string;
  issue: string;
  service: string;
  date: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  cost: number;
  technician: string;
  rating?: number;
  description: string;
  parts: string[];
  laborHours: number;
}

export default function RepairHistoryPage() {
  const [repairHistory, setRepairHistory] = useState<RepairHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    // Simulate loading repair history
    setRepairHistory([
      {
        id: 1,
        vehicle: 'Honda Civic 2020',
        licensePlate: '59A-123.45',
        issue: 'Engine making strange noise',
        service: 'Regular Maintenance',
        date: '2025-01-10',
        status: 'completed',
        cost: 1500000,
        technician: 'John Smith',
        rating: 5,
        description: 'Oil change, oil filter replacement, brake system inspection',
        parts: ['5W-30 Engine Oil', 'Oil Filter', 'Air Filter'],
        laborHours: 2
      },
      {
        id: 2,
        vehicle: 'Toyota Camry 2019',
        licensePlate: '51G-678.90',
        issue: 'Brake noise',
        service: 'Brake Repair',
        date: '2025-01-08',
        status: 'completed',
        cost: 3200000,
        technician: 'Jane Doe',
        rating: 4,
        description: 'Front brake pad replacement, brake fluid check, handbrake adjustment',
        parts: ['Front Brake Pads', 'DOT4 Brake Fluid', 'Brake Cable'],
        laborHours: 4
      },
      {
        id: 3,
        vehicle: 'BMW X5 2021',
        licensePlate: '30F-246.80',
        issue: 'Check engine light',
        service: 'Engine Inspection',
        date: '2025-01-05',
        status: 'completed',
        cost: 2500000,
        technician: 'Mike Johnson',
        rating: 5,
        description: 'Engine diagnostic, spark plug replacement, ignition system inspection',
        parts: ['Spark Plugs', 'Spark Plug Wires', 'Fuel Filter'],
        laborHours: 3
      },
      {
        id: 4,
        vehicle: 'Honda Civic 2020',
        licensePlate: '59A-123.45',
        issue: 'Tire wear',
        service: 'Tire Replacement',
        date: '2025-01-03',
        status: 'completed',
        cost: 800000,
        technician: 'John Smith',
        rating: 4,
        description: 'Replace 4 new tires, wheel balancing, tire pressure check',
        parts: ['205/55R16 Tires x4', 'Tire Valves'],
        laborHours: 1
      },
      {
        id: 5,
        vehicle: 'Toyota Camry 2019',
        licensePlate: '51G-678.90',
        issue: 'AC not cooling',
        service: 'AC Repair',
        date: '2024-12-28',
        status: 'completed',
        cost: 4500000,
        technician: 'Jane Doe',
        rating: 5,
        description: 'AC compressor replacement, gas refill, cooling system inspection',
        parts: ['AC Compressor', 'R134a Gas', 'Cabin Filter'],
        laborHours: 5
      }
    ]);
  }, []);

  const filteredHistory = repairHistory.filter(item => {
    const matchesSearch = 
      item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate === 'last-week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      matchesDate = new Date(item.date) >= lastWeek;
    } else if (filterDate === 'last-month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      matchesDate = new Date(item.date) >= lastMonth;
    } else if (filterDate === 'last-year') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      matchesDate = new Date(item.date) >= lastYear;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repair History</h1>
        <p className="text-muted-foreground">
          Review your previous repair records
        </p>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by vehicle, service, license plate..."
              className="w-full rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <select
              className="rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <select
              className="rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="last-week">Last Week</option>
              <option value="last-month">Last Month</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* History list */}
      {filteredHistory.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{repair.vehicle}</div>
                          <div className="text-sm text-gray-500">{repair.licensePlate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{repair.issue}</div>
                      <div className="text-sm text-gray-500">{repair.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{repair.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RepairStatusBadge status={repair.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(repair.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/customer/repairs/${repair.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <HistoryIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No repair history found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterDate !== 'all' 
              ? 'No results match your current filters.'
              : 'You have no repair history yet.'}
          </p>
        </div>
      )}
    </div>
  );
}