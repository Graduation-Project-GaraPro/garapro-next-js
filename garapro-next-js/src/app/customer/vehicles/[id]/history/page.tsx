"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter,
  Car
} from 'lucide-react';
import { useVehicles } from '@/hooks/customer/useVehicles';
import { useRepairs } from '@/hooks/customer/useRepairs';

export default function VehicleHistoryPage() {
  const params = useParams();
  const vehicleId = params.id;
  
  const { vehicles } = useVehicles();
  const { repairs } = useRepairs();
  
  const [vehicle, setVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Get vehicle information from ID
  useEffect(() => {
    const foundVehicle = vehicles.find(v => v.id.toString() === vehicleId);
    if (foundVehicle) {
      setVehicle(foundVehicle);
    }
  }, [vehicleId, vehicles]);
  
  // Filter repair history for this vehicle
  const vehicleRepairs = repairs
    .filter(repair => repair.licensePlate === vehicle?.licensePlate)
    .filter(repair => {
      // Search filter
      const matchesSearch = 
        repair.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Link href={`/customer/vehicles/${vehicleId}`} className="mr-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
          <div className="flex items-center mt-1 text-gray-500">
            <Car className="h-4 w-4 mr-1" />
            <span>{vehicle.licensePlate}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by issue or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Repair History List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Repair History</h2>
        </div>
        
        {vehicleRepairs.length > 0 ? (
          <div className="divide-y">
            {vehicleRepairs.map((repair) => (
              <div key={repair.id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{repair.issue}</h3>
                      <RepairStatusBadge status={repair.status} className="ml-2" />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{repair.date}</div>
                  </div>
                  
                  <Link 
                    href={`/customer/repairs/${repair.id}`}
                    className="mt-4 md:mt-0 text-blue-500 hover:text-blue-700"
                  >
                    View details
                  </Link>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{repair.description}</p>
                </div>
                
                {repair.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{repair.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${repair.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No repair history found</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'No results match your filters.'
                : 'This vehicle has no repair history yet.'}
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="mt-4 text-blue-500 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Component to display repair status
function RepairStatusBadge({ status, className = '' }) {
  let color = "";
  let text = "";
  let icon = null;
  
  switch(status) {
    case "completed":
      color = "bg-green-100 text-green-800";
      text = "Completed";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "in-progress":
      color = "bg-blue-100 text-blue-800";
      text = "In Progress";
      icon = <Wrench className="h-3 w-3 mr-1" />;
      break;
    case "pending":
      color = "bg-yellow-100 text-yellow-800";
      text = "Pending";
      icon = <Calendar className="h-3 w-3 mr-1" />;
      break;
    case "cancelled":
      color = "bg-red-100 text-red-800";
      text = "Cancelled";
      icon = <AlertTriangle className="h-3 w-3 mr-1" />;
      break;
    default:
      color = "bg-gray-100 text-gray-800";
      text = status;
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full flex items-center ${color} ${className}`}>
      {icon}
      {text}
    </span>
  );
}
