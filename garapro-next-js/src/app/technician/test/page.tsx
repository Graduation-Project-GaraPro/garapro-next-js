"use client";
import { useState } from "react";
import { 
  FaCar, FaSearch, FaChevronDown, FaChevronUp, 
  FaRuler, FaCog, FaRoad, FaShieldAlt, FaTachometerAlt,
  FaWrench, FaEye
} from "react-icons/fa";

export default function VehicleInformation() {
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Toggle dropdown
  const toggleSection = (vehicleId: number, sectionId: string) => {
    const key = `${vehicleId}-${sectionId}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Vehicle data
  const vehicleData = [
    {
      id: 1,
      name: "Camry 2.5Q",
      make: "Toyota",
      sections: [
        {
          id: "dimensions",
          title: "1. Dimensions & Weight",
          icon: FaRuler,
          color: "bg-blue-50 border-blue-200",
          iconBg: "bg-blue-600",
          data: {
            "Overall size (L×W×H)": "4885 × 1840 × 1455 mm",
            "Wheelbase": "2825 mm",
            "Ground clearance": "155 mm",
            "Minimum turning radius": "5.7 m",
            "Curb weight": "1530 kg",
            "Gross weight": "2030 kg"
          }
        },
        {
          id: "engine",
          title: "2. Engine",
          icon: FaCog,
          color: "bg-orange-50 border-orange-200",
          iconBg: "bg-orange-600",
          data: {
            "Engine type": "Petrol",
            "Displacement": "2487 cc (2.5L)",
            "Max power": "181 hp / 133 kW @ 6000 rpm",
            "Max torque": "231 Nm @ 4100 rpm",
            "Cylinders": "4-inline (I4)",
            "Emission standard": "Euro 5"
          }
        },
        {
          id: "drivetrain",
          title: "3. Drivetrain",
          icon: FaRoad,
          color: "bg-green-50 border-green-200",
          iconBg: "bg-green-600",
          data: {
            "Drive type": "Front-wheel drive (FWD)",
            "Transmission": "CVT automatic",
            "Gear levels": "Stepless with 10 simulated gears"
          }
        },
        {
          id: "chassis",
          title: "4. Chassis & Suspension",
          icon: FaWrench,
          color: "bg-purple-50 border-purple-200",
          iconBg: "bg-purple-600",
          data: {
            "Front suspension": "MacPherson",
            "Rear suspension": "Multi-link",
            "Front brakes": "Ventilated discs",
            "Rear brakes": "Solid discs",
            "Steering system": "Electric power steering (EPS)"
          }
        },
        {
          id: "performance",
          title: "5. Performance",
          icon: FaTachometerAlt,
          color: "bg-red-50 border-red-200",
          iconBg: "bg-red-600",
          data: {
            "Top speed": "190 km/h",
            "0-100 km/h acceleration": "9.8 sec",
            "Fuel consumption": "7.2 L/100km",
            "Fuel tank capacity": "60 L"
          }
        },
        {
          id: "wheels",
          title: "6. Wheels & Tires",
          icon: FaRoad,
          color: "bg-gray-50 border-gray-200",
          iconBg: "bg-gray-600",
          data: {
            "Tire size": "215/55 R17",
            "Wheel size": "17 inches",
            "Wheel material": "Alloy"
          }
        },
        {
          id: "exterior",
          title: "7. Exterior & Interior",
          icon: FaEye,
          color: "bg-indigo-50 border-indigo-200",
          iconBg: "bg-indigo-600",
          data: {
            "Seats": "5",
            "Body style": "Sedan",
            "Lighting system": "Full LED",
            "Seats material": "Premium leather, power adjustable",
            "Air conditioning": "Dual-zone automatic",
            "Infotainment": "10.5-inch touchscreen",
            "Audio system": "JBL 9 speakers"
          }
        },
        {
          id: "safety",
          title: "8. Safety",
          icon: FaShieldAlt,
          color: "bg-emerald-50 border-emerald-200",
          iconBg: "bg-emerald-600",
          data: {
            "Airbags": "7 (front, side, curtain, knee)",
            "ABS": "Yes",
            "EBD": "Yes",
            "BA": "Yes",
            "ESP": "Yes (VSC)",
            "TCS": "Yes",
            "HSA": "Yes",
            "Cruise Control": "Yes (Adaptive)",
            "Sensors & Cameras": "Rear camera, parking sensors, blind-spot monitor"
          }
        }
      ]
    },
    {
      id: 2,
      name: "Civic RS",
      make: "Honda",
      sections: [
        {
          id: "dimensions",
          title: "1. Dimensions & Weight",
          icon: FaRuler,
          color: "bg-blue-50 border-blue-200",
          iconBg: "bg-blue-600",
          data: {
            "Overall size (L×W×H)": "4678 × 1802 × 1415 mm",
            "Wheelbase": "2735 mm",
            "Ground clearance": "134 mm",
            "Minimum turning radius": "5.5 m",
            "Curb weight": "1335 kg",
            "Gross weight": "1835 kg"
          }
        },
        {
          id: "engine",
          title: "2. Engine",
          icon: FaCog,
          color: "bg-orange-50 border-orange-200",
          iconBg: "bg-orange-600",
          data: {
            "Engine type": "Petrol Turbo",
            "Displacement": "1498 cc (1.5L)",
            "Max power": "178 hp / 131 kW @ 6000 rpm",
            "Max torque": "240 Nm @ 1700–5500 rpm",
            "Cylinders": "4-inline DOHC VTEC Turbo",
            "Emission standard": "Euro 5"
          }
        },
        {
          id: "drivetrain",
          title: "3. Drivetrain",
          icon: FaRoad,
          color: "bg-green-50 border-green-200",
          iconBg: "bg-green-600",
          data: {
            "Drive type": "Front-wheel drive (FWD)",
            "Transmission": "CVT automatic",
            "Gear levels": "Stepless with paddle shift"
          }
        },
        {
          id: "chassis",
          title: "4. Chassis & Suspension",
          icon: FaWrench,
          color: "bg-purple-50 border-purple-200",
          iconBg: "bg-purple-600",
          data: {
            "Front suspension": "MacPherson",
            "Rear suspension": "Torsion beam",
            "Front brakes": "Ventilated discs",
            "Rear brakes": "Solid discs",
            "Steering system": "Electric power steering (EPS)"
          }
        },
        {
          id: "performance",
          title: "5. Performance",
          icon: FaTachometerAlt,
          color: "bg-red-50 border-red-200",
          iconBg: "bg-red-600",
          data: {
            "Top speed": "200 km/h",
            "0-100 km/h acceleration": "8.2 sec",
            "Fuel consumption": "6.8 L/100km",
            "Fuel tank capacity": "47 L"
          }
        },
        {
          id: "wheels",
          title: "6. Wheels & Tires",
          icon: FaRoad,
          color: "bg-gray-50 border-gray-200",
          iconBg: "bg-gray-600",
          data: {
            "Tire size": "215/50 R17",
            "Wheel size": "17 inches",
            "Wheel material": "Sport alloy"
          }
        },
        {
          id: "exterior",
          title: "7. Exterior & Interior",
          icon: FaEye,
          color: "bg-indigo-50 border-indigo-200",
          iconBg: "bg-indigo-600",
          data: {
            "Seats": "5",
            "Body style": "Sport sedan",
            "Lighting system": "Full LED",
            "Seats material": "Leather/Alcantara sport",
            "Air conditioning": "Single-zone automatic",
            "Infotainment": "9-inch Honda CONNECT",
            "Audio system": "8 premium speakers"
          }
        },
        {
          id: "safety",
          title: "8. Safety",
          icon: FaShieldAlt,
          color: "bg-emerald-50 border-emerald-200",
          iconBg: "bg-emerald-600",
          data: {
            "Airbags": "6 (front, side, curtain)",
            "ABS": "Yes",
            "EBD": "Yes",
            "BA": "Yes",
            "ESP": "Yes (VSA)",
            "TCS": "Yes",
            "HSA": "Yes",
            "Cruise Control": "Yes (Honda SENSING)",
            "Sensors & Cameras": "Rear camera, front/rear sensors, Honda SENSING suite"
          }
        }
      ]
    }
  ];

  // Search vehicles
  const getFilteredVehicles = () => {
    if (!vehicleSearch.trim()) return vehicleData;
    const searchTerm = vehicleSearch.toLowerCase().trim();
    return vehicleData.filter(vehicle => 
      vehicle.name.toLowerCase().includes(searchTerm) ||
      vehicle.make.toLowerCase().includes(searchTerm) ||
      `${vehicle.make} ${vehicle.name}`.toLowerCase().includes(searchTerm)
    );
  };

  const filteredVehicles = getFilteredVehicles();
  return (
    <div className="space-y-6 p-3 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative inline-block mb-4">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
              <div className="relative flex items-center gap-2 px-4 py-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <FaCar className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col items-start">
                 <h2 className="text-[28px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                   Vehicle Information Lookup
                 </h2>
                   <p className="text-gray-700 italic">Find detailed information about the car</p>
                </div>
            </div>
            </div>
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 py-7 mb-3 border border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter vehicle name or brand to search..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-100"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
          </div>
          
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Found {filteredVehicles.length} vehicles.
              {vehicleSearch.trim() && ` cho "${vehicleSearch}"`}
            </span>
            <span className="text-gray-400">Total: {vehicleData.length} in the database.</span>
          </div>
        </div>

        {/* Results Section */}
        {filteredVehicles.length > 0 ? (
          <div className="space-y-8  max-h-[47vh] overflow-y-auto rounded-xl rounded-scroll">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Vehicle Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        {vehicle.name}
                      </h2>
                      <p className="text-[15px] text-gray-600">Automaker: <span className="font-semibold">{vehicle.make}</span></p>
                    </div>                    
                  </div>
                </div>

                {/* Vehicle Sections */}
                <div className="p-8 py-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {vehicle.sections.map((section) => {
                        const isExpanded = expandedSections[`${vehicle.id}-${section.id}`];
                        const IconComponent = section.icon;

                        return (
                          <div
                            key={section.id}
                            className={`border-2 rounded-xl ${section.color} self-start`}
                          >
                            {/* Section Header */}
                            <button
                              onClick={() => toggleSection(vehicle.id, section.id)}
                              className="w-full px-6 py-2 flex items-center justify-between hover:bg-opacity-70 transition-all duration-200"
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-10 h-10 ${section.iconBg} rounded-lg flex items-center justify-center mr-4`}
                                >
                                  <IconComponent className="text-white text-xl" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700">
                                  {section.title}
                                </h3>
                              </div>
                              <div className="text-gray-500">
                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                              </div>
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                              <div className="px-6 pb-6 bg-white bg-opacity-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(section.data).map(([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                                    >
                                      <span className="font-medium text-gray-700">{key}:</span>
                                      <span className="text-gray-800 font-semibold text-right">
                                        {value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No vehicles found</h3>
              <p className="text-gray-500 text-lg">
                No vehicles match your search &quot;
                <span className="font-medium">{vehicleSearch}</span>
                &quot;
              </p>
             <p className="text-gray-400 mt-2">Try adjusting your search keywords</p>
          </div>  
        )}
      </div>
    </div>
  );
}