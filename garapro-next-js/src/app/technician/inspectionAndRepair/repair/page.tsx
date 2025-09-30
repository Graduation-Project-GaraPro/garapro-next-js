"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Wrench, 
  Car, 
  Calendar,
  User,
  IdCard,
  Activity,
  Clock,
  CheckCircle, 
  Filter,
  Search,
  Eye, 
  Sparkles
} from "lucide-react";

interface Vehicle {
  id: number;
  vehicle: string;
  licensePlate: string;
  customer: string;
  assignedDate: string;
  status: string;
}
type TaskStatus = "New" | "Completed" | "In Progress";

export default function ConditionInspection() {
  const [selectedVehicle] = useState<Vehicle | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const router = useRouter(); // Initialize useRouter
  const [searchTerm, setSearchTerm] = useState("");
  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % placeholderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  });

  const assignedVehicles = [
    {
      id: 1,
      vehicle: "Tesla Model S 2023",
      licensePlate: "29A-123.45",
      customer: "John Smith",
      assignedDate: "2024-08-28",
      status: "New",  
    },
    {
      id: 2,
      vehicle: "BMW i8 2022",
      licensePlate: "30B-678.90",
      customer: "Jane Wilson",
      assignedDate: "2024-08-28",
      status: "New",
    },
    {
      id: 3,
      vehicle: "Audi RS6 2024",
      licensePlate: "31C-111.22",
      customer: "Mike Johnson",
      assignedDate: "2024-08-27",
      status: "Completed",
    },
    {
      id: 4,
      vehicle: "Mercedes AMG GT",
      licensePlate: "32D-333.44",
      customer: "Sarah Davis",
      assignedDate: "2024-08-26",
      status: "In Progress",
    }
  ];

  const placeholderImages = [
    "/images/image6.png",
    "/images/image18.jpg",
    "/images/image7.png",
     "/images/image17.jpg"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "from-blue-400/70 to-cyan-500/70";
      case "Completed":
        return "from-emerald-400/70 to-green-500/70";
      case "In Progress":
        return "from-amber-300/70 to-orange-300/70";
      default:
        return "from-blue-400/70 to-purple-500/70";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <Sparkles className="w-5 h-5" />;
      case "Approval":
        return <CheckCircle className="w-5 h-5" />;
      case "In Progress":
        return <Activity className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };
  
 const searchedVehicles = (filter === "all"
  ? assignedVehicles
  : assignedVehicles.filter((vehicle) => vehicle.status === filter)
).filter(
  (vehicle) =>
    vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.licensePlate &&
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
);

  // Main vehicle list view
  if (!selectedVehicle) {
    return (
      <div className="flex gap-6 bg-gradient-to-br from-slate-100 via-blue-300 to-indigo-100 p-5 rounded-lg  h-160">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-1 gap-4">
          {/* Animated Header */}
          <div className="relative inline-block mb-1">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-3 py-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Wrench className="w-7 h-7 text-white"/>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[27px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Vehicle Repair Progress
                </h2>
                <p className="text-gray-600 italic">Your Repair Journey, Made Visible.</p>
              </div>
            </div>
          </div>
          {/* Search */}
           <div className="px-6 mb-2 flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by vehicle, license plate or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-[16px] pl-12 pr-4 py-3 border-3 border-gray-300 rounded-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
            />
          </div>
        </div>
         </div>
          <div className="flex items-center justify-between mb-2 gap-4">
            <h2 className="text-[16px] font-semibold text-gray-800 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              Assigned Vehicles ({searchedVehicles.length})
            </h2>
            {/* Filter Section */}
            <div className="flex items-center space-x-2 bg-white/40 rounded-xl p-2 shadow-sm border border-gray-200">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter:</span>
              <div className="flex space-x-2">
                {(["all", "New","In Progress" , "Completed"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-1.5 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                      filter === status
                        ? "bg-blue-500 text-white hover:bg-blue-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-400"
                    }`}
                  >
                    {status === "all" ? "All" : status.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="max-h-[61vh] overflow-y-auto rounded-xl rounded-scroll">              
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Vehicle List */}            
              <div className="lg:col-span-2 space-y-4">              
                {searchedVehicles
                 .filter(
            (vehicle) =>
              vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
              vehicle.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (vehicle.licensePlate &&
                vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
          )
                .map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="w-205 h-52 relative bg-[url('/images/image13.png')] bg-cover bg-no-repeat before:absolute before:inset-0 before:bg-black before:opacity-30 before:rounded-lg group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-1"

                  >
                    {/* Content */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>                 
                    <div className="relative p-6">
                      {/* Main content*/}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                            <Car className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="bg-white/80 p-1 rounded-lg inline-block">
                              <h3 className="text-xl font-semibold text-black group-hover:text-blue-600 transition-colors">
                                {vehicle.vehicle}
                              </h3>
                              <p className="text-gray-900 flex items-center gap-2 mt-1">
                                <User className="w-4 h-4" />
                                {vehicle.customer}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(vehicle.status)} text-white font-medium flex items-center gap-2 shadow-lg`}>
                          {getStatusIcon(vehicle.status)}
                          {vehicle.status}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center font-bold gap-2 text-white">
                          <IdCard className="w-4 h-4" />
                          <span className="text-sm">{vehicle.licensePlate}</span>
                        </div>
                        <div className="flex items-center font-bold gap-2 text-white">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{vehicle.assignedDate}</span>
                        </div>
                      </div>
                      {vehicle.status === "New" ? (
                        <div className="flex items-center justify-between mb-4 gap-4">           
                          <button 
                          onClick={() => router.push(`repair/repairProgress?id=${vehicle.id}`)}
                            className="w-full py-3 bg-gradient-to-r from-blue-600/70 to-cyan-600 hover:from-blue-700/70 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            Start Repair
                          </button>
                        </div>                      
                      ) : vehicle.status === "Completed" ? (
                        <div className="flex items-center justify-between mb-4 gap-4">
                          <button
                            onClick={() => router.push(`repair/repairProgress?id=${vehicle.id}`)} // Navigate to repairProgress page
                            className="w-full py-3 bg-gradient-to-r from-emerald-500/70 to-green-700 hover:from-emerald-700/70 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            View Repair
                          </button>
                        </div>
                      ) : vehicle.status === "In Progress" ? ( 
                          <div className="flex items-center justify-between mb-4 gap-4">
                          <button
                            onClick={() => router.push(`repair/repairProgress?id=${vehicle.id}`)} // Navigate to repairProgress page
                            className="w-full py-3 bg-gradient-to-r from-amber-300/70 to-orange-300/70 hover:from-amber-400/70 hover:to-orange-400/70 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Wrench className="w-5 h-5" />
                            Start Repair
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {searchedVehicles.length === 0 && (
                  <div className="text-center py-20 absolute left-130">
                    <div className="bg-white/80 rounded-2xl p-8 shadow-lg">
                      <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No vehicles found</h3>
                      <p className="text-gray-500">No vehicles match the selected filter criteria.</p>
                      <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                  >
                  Clear search
              </button>
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Image Slideshow */}
        <div className="lg:col-span1">
          <div className="">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="relative h-135 w-85 overflow-hidden">
                {/* Slideshow */}
                <div className="relative h-full">
                  <Image
                    src={placeholderImages[currentImageIndex]}
                    alt={`Professional inspection ${currentImageIndex + 1}`}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover transition-all duration-1000 transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                {/* Overlay text */}
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Professional</h3>
                  <p className="text-lg opacity-90">Vehicle Inspection</p>
                </div>
                {/* Navigation dots */}
                <div className="absolute bottom-4 right-6 flex space-x-2">
                  {placeholderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Stats panel */}
              <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {assignedVehicles.filter(v => v.status === "New").length}
                    </div>
                    <div className="text-xs text-gray-600">New</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      {assignedVehicles.filter(v => v.status === "Completed").length}
                    </div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>                
                  <div>
                    <div className="text-xl font-bold text-cyan-600">
                      {assignedVehicles.filter(v => v.status === "In Progress").length}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}