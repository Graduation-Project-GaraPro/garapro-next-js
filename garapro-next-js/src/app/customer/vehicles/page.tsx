"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Car, Plus, Search, Filter, ArrowRight, Edit } from 'lucide-react';
import { useVehicles } from '@/hooks/customer/useVehicles';

export default function VehiclesPage() {
  const { vehicles } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lọc phương tiện theo từ khóa tìm kiếm
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Phương tiện của tôi</h1>
        <Link 
          href="/customer/account" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm phương tiện
        </Link>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo biển số, hãng xe, mẫu xe..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <Filter className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Danh sách phương tiện */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-gray-500 mt-1">{vehicle.year} · {vehicle.color}</p>
                  </div>
                  <Link href={`/customer/vehicles/${vehicle.id}`}>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                  </Link>
                </div>
                
                <div className="mt-4 flex items-center">
                  <Car className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-lg font-bold">{vehicle.licensePlate}</span>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Link 
                    href={`/customer/vehicles/${vehicle.id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                  >
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
            <Car className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy phương tiện</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? 'Không có phương tiện nào khớp với tìm kiếm của bạn.' : 'Bạn chưa có phương tiện nào. Hãy thêm phương tiện đầu tiên của bạn.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link 
                  href="/customer/account" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm phương tiện
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}