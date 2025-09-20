"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Car, Wrench, MapPin, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { validateTextField, validateSelectField } from '@/utils/validate/formValidation';

// Định nghĩa kiểu dữ liệu
interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export default function CreateAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = searchParams.get('service');
  
  // State cho form đặt lịch
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(preSelectedServiceId || '');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho các dropdown
  const [servicesOpen, setServicesOpen] = useState(false);
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [branchesOpen, setBranchesOpen] = useState(false);
  
  // Dữ liệu mẫu
  const services: Service[] = [
    { id: '1', name: 'Bảo dưỡng định kỳ', price: 800000, duration: '2-3 giờ', category: 'maintenance' },
    { id: '2', name: 'Thay dầu động cơ', price: 350000, duration: '30-45 phút', category: 'maintenance' },
    { id: '3', name: 'Kiểm tra và sửa chữa phanh', price: 600000, duration: '1-2 giờ', category: 'repair' },
    { id: '4', name: 'Cân chỉnh bánh xe', price: 450000, duration: '1 giờ', category: 'maintenance' },
    { id: '5', name: 'Kiểm tra và sửa chữa điều hòa', price: 750000, duration: '1-3 giờ', category: 'repair' },
  ];
  
  const vehicles: Vehicle[] = [
    { id: '1', make: 'Toyota', model: 'Camry', year: 2019, licensePlate: '29A-12345' },
    { id: '2', make: 'Honda', model: 'Civic', year: 2020, licensePlate: '30A-54321' },
    { id: '3', make: 'Ford', model: 'Ranger', year: 2021, licensePlate: '29B-67890' },
  ];
  
  const branches: Branch[] = [
    { id: '1', name: 'GaraPro Hà Nội', address: '123 Đường Láng, Đống Đa', city: 'Hà Nội', phone: '024-1234-5678' },
    { id: '2', name: 'GaraPro Hồ Chí Minh', address: '456 Lê Lợi, Quận 1', city: 'Hồ Chí Minh', phone: '028-8765-4321' },
    { id: '3', name: 'GaraPro Đà Nẵng', address: '789 Nguyễn Văn Linh, Hải Châu', city: 'Đà Nẵng', phone: '0236-9876-5432' },
  ];
  
  // Tạo danh sách các ngày trong tháng hiện tại
  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      // Chỉ hiển thị các ngày từ hôm nay trở đi
      if (date >= new Date(today.setHours(0, 0, 0, 0))) {
        days.push(date);
      }
    }
    
    return days;
  };
  
  // Tạo các khung giờ có sẵn
  const getTimeSlots = () => {
    const slots: TimeSlot[] = [
      { id: '1', time: '08:00', available: true },
      { id: '2', time: '09:00', available: true },
      { id: '3', time: '10:00', available: false },
      { id: '4', time: '11:00', available: true },
      { id: '5', time: '13:30', available: true },
      { id: '6', time: '14:30', available: true },
      { id: '7', time: '15:30', available: false },
      { id: '8', time: '16:30', available: true },
    ];
    
    return slots;
  };
  
  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  // Format ngày tháng
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Xử lý khi chuyển bước
  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Xử lý khi gửi form
  const validateForm = () => {
    let isValid = true;
    const errors: Record<string, string> = {};
    
    // Validate service selection
    const serviceValidation = validateSelectField(selectedService, {
      required: true,
      label: 'Dịch vụ'
    });
    if (!serviceValidation.isValid) {
      errors.service = serviceValidation.error;
      isValid = false;
    }
    
    // Validate vehicle selection
    const vehicleValidation = validateSelectField(selectedVehicle, {
      required: true,
      label: 'Phương tiện'
    });
    if (!vehicleValidation.isValid) {
      errors.vehicle = vehicleValidation.error;
      isValid = false;
    }
    
    // Validate date selection
    if (!selectedDate) {
      errors.date = 'Vui lòng chọn ngày';
      isValid = false;
    }
    
    // Validate time slot selection
    const timeSlotValidation = validateSelectField(selectedTimeSlot, {
      required: true,
      label: 'Thời gian'
    });
    if (!timeSlotValidation.isValid) {
      errors.timeSlot = timeSlotValidation.error;
      isValid = false;
    }
    
    // Validate branch selection
    const branchValidation = validateSelectField(selectedBranch, {
      required: true,
      label: 'Chi nhánh'
    });
    if (!branchValidation.isValid) {
      errors.branch = branchValidation.error;
      isValid = false;
    }
    
    // Validate notes (optional)
    const notesValidation = validateTextField(notes, {
      required: false,
      maxLength: 500,
      label: 'Ghi chú'
    });
    if (!notesValidation.isValid) {
      errors.notes = notesValidation.error;
      isValid = false;
    }
    
    return { isValid, errors };
  };

  const handleSubmit = async () => {
    const { isValid, errors } = validateForm();
    
    if (!isValid) {
      // Hiển thị lỗi validation
      console.error('Form validation errors:', errors);
      alert('Vui lòng kiểm tra lại thông tin đặt lịch');
      return;
    }
    
    setIsSubmitting(true);
    
    // Giả lập API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Chuyển hướng đến trang xác nhận
      router.push('/customer/services/appointments');
    }, 1500);
  };
  
  // Kiểm tra xem có thể chuyển sang bước tiếp theo không
  const canProceed = () => {
    switch (step) {
      case 1:
        const serviceValidation = validateSelectField(selectedService, {
          required: true,
          label: 'Dịch vụ'
        });
        return serviceValidation.isValid;
      case 2:
        const vehicleValidation = validateSelectField(selectedVehicle, {
          required: true,
          label: 'Phương tiện'
        });
        return vehicleValidation.isValid;
      case 3:
        const dateValid = selectedDate !== null;
        const timeSlotValidation = validateSelectField(selectedTimeSlot, {
          required: true,
          label: 'Thời gian'
        });
        const branchValidation = validateSelectField(selectedBranch, {
          required: true,
          label: 'Chi nhánh'
        });
        return dateValid && timeSlotValidation.isValid && branchValidation.isValid;
      default:
        return true;
    }
  };
  
  // Tự động chọn dịch vụ nếu có trong query params
  useEffect(() => {
    if (preSelectedServiceId) {
      setSelectedService(preSelectedServiceId);
    }
  }, [preSelectedServiceId]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/customer/services" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại danh sách dịch vụ
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-6">
          <h1 className="text-2xl font-bold">Đặt lịch hẹn</h1>
          <p className="mt-2 opacity-90">Hoàn thành các bước dưới đây để đặt lịch hẹn dịch vụ</p>
        </div>
        
        {/* Thanh tiến trình */}
        <div className="px-6 pt-6">
          <div className="flex justify-between mb-2">
            <div className="text-sm font-medium">
              Bước {step}/4: {step === 1 ? 'Chọn dịch vụ' : step === 2 ? 'Chọn phương tiện' : step === 3 ? 'Chọn thời gian và địa điểm' : 'Xác nhận thông tin'}
            </div>
            <div className="text-sm text-gray-500">{step}/4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Nội dung form */}
        <div className="p-6">
          {/* Bước 1: Chọn dịch vụ */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Chọn dịch vụ</h2>
              
              <div className="relative">
                <div 
                  className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setServicesOpen(!servicesOpen)}
                >
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-blue-500 mr-3" />
                    {selectedService ? (
                      <span>{services.find(s => s.id === selectedService)?.name}</span>
                    ) : (
                      <span className="text-gray-500">Chọn dịch vụ</span>
                    )}
                  </div>
                  {servicesOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                {servicesOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {services.map((service) => (
                      <div 
                        key={service.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedService === service.id ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedService(service.id);
                          setServicesOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{service.duration}</div>
                          </div>
                          <div className="text-blue-500 font-medium">
                            {formatPrice(service.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedService && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium">Chi tiết dịch vụ</h3>
                  <div className="mt-2">
                    {(() => {
                      const service = services.find(s => s.id === selectedService);
                      if (!service) return null;
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tên dịch vụ:</span>
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Thời gian dự kiến:</span>
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giá dịch vụ:</span>
                            <span className="font-medium text-blue-500">{formatPrice(service.price)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Bước 2: Chọn phương tiện */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Chọn phương tiện</h2>
              
              <div className="relative">
                <div 
                  className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setVehiclesOpen(!vehiclesOpen)}
                >
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-blue-500 mr-3" />
                    {selectedVehicle ? (
                      <span>
                        {(() => {
                          const vehicle = vehicles.find(v => v.id === selectedVehicle);
                          return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : '';
                        })()}
                      </span>
                    ) : (
                      <span className="text-gray-500">Chọn phương tiện</span>
                    )}
                  </div>
                  {vehiclesOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                {vehiclesOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {vehicles.map((vehicle) => (
                      <div 
                        key={vehicle.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedVehicle === vehicle.id ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedVehicle(vehicle.id);
                          setVehiclesOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                            <div className="text-sm text-gray-500 mt-1">Năm SX: {vehicle.year}</div>
                          </div>
                          <div className="text-blue-500 font-medium">
                            {vehicle.licensePlate}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-3 border-t">
                      <Link 
                        href="/customer/vehicles"
                        className="text-blue-500 text-sm flex items-center justify-center hover:underline"
                      >
                        Quản lý phương tiện
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedVehicle && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium">Chi tiết phương tiện</h3>
                  <div className="mt-2">
                    {(() => {
                      const vehicle = vehicles.find(v => v.id === selectedVehicle);
                      if (!vehicle) return null;
                      
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hãng xe:</span>
                            <span className="font-medium">{vehicle.make}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mẫu xe:</span>
                            <span>{vehicle.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Năm sản xuất:</span>
                            <span>{vehicle.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Biển số xe:</span>
                            <span className="font-medium">{vehicle.licensePlate}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Bước 3: Chọn thời gian và địa điểm */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Chọn thời gian và địa điểm</h2>
              
              <div className="space-y-6">
                {/* Chọn ngày */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ngày
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth().slice(0, 14).map((date, index) => (
                      <div 
                        key={index}
                        className={`text-center p-2 rounded-lg cursor-pointer border ${selectedDate && date.toDateString() === selectedDate.toDateString() ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-50 border-gray-200'}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-xs mb-1">
                          {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </div>
                        <div className="font-medium">
                          {date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chọn giờ */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn giờ
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {getTimeSlots().map((slot) => (
                        <div 
                          key={slot.id}
                          className={`
                            text-center p-3 rounded-lg cursor-pointer border 
                            ${!slot.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                              selectedTimeSlot === slot.id ? 'bg-blue-500 text-white border-blue-500' : 
                              'hover:bg-gray-50 border-gray-200'}
                          `}
                          onClick={() => {
                            if (slot.available) {
                              setSelectedTimeSlot(slot.id);
                            }
                          }}
                        >
                          <div className="font-medium">
                            {slot.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Chọn chi nhánh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn chi nhánh
                  </label>
                  <div className="relative">
                    <div 
                      className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => setBranchesOpen(!branchesOpen)}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                        {selectedBranch ? (
                          <span>{branches.find(b => b.id === selectedBranch)?.name}</span>
                        ) : (
                          <span className="text-gray-500">Chọn chi nhánh</span>
                        )}
                      </div>
                      {branchesOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    {branchesOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {branches.map((branch) => (
                          <div 
                            key={branch.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedBranch === branch.id ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              setSelectedBranch(branch.id);
                              setBranchesOpen(false);
                            }}
                          >
                            <div>
                              <div className="font-medium">{branch.name}</div>
                              <div className="text-sm text-gray-500 mt-1">{branch.address}</div>
                              <div className="text-sm text-gray-500 mt-1">{branch.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Ghi chú */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Bước 4: Xác nhận thông tin */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Xác nhận thông tin đặt lịch</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                {/* Thông tin dịch vụ */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <Wrench className="h-5 w-5 text-blue-500 mr-2" />
                    Dịch vụ
                  </h3>
                  <div className="mt-2 pl-7">
                    {(() => {
                      const service = services.find(s => s.id === selectedService);
                      if (!service) return null;
                      
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">Thời gian dự kiến: {service.duration}</div>
                          <div className="text-blue-500 font-medium">{formatPrice(service.price)}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Thông tin phương tiện */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <Car className="h-5 w-5 text-blue-500 mr-2" />
                    Phương tiện
                  </h3>
                  <div className="mt-2 pl-7">
                    {(() => {
                      const vehicle = vehicles.find(v => v.id === selectedVehicle);
                      if (!vehicle) return null;
                      
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-gray-600">Năm sản xuất: {vehicle.year}</div>
                          <div className="text-blue-500 font-medium">{vehicle.licensePlate}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Thông tin thời gian */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    Thời gian
                  </h3>
                  <div className="mt-2 pl-7">
                    {selectedDate && (
                      <div className="space-y-1">
                        <div className="font-medium">{formatDate(selectedDate)}</div>
                        <div className="text-blue-500">
                          {getTimeSlots().find(slot => slot.id === selectedTimeSlot)?.time}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thông tin chi nhánh */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    Chi nhánh
                  </h3>
                  <div className="mt-2 pl-7">
                    {(() => {
                      const branch = branches.find(b => b.id === selectedBranch);
                      if (!branch) return null;
                      
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-gray-600">{branch.address}</div>
                          <div className="text-sm text-gray-600">{branch.phone}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Ghi chú */}
                {notes && (
                  <div>
                    <h3 className="font-medium">Ghi chú</h3>
                    <div className="mt-2 text-gray-600">
                      {notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800">Lưu ý</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Vui lòng đến đúng giờ đã đặt lịch.</li>
                  <li>• Mang theo giấy tờ xe và giấy phép lái xe.</li>
                  <li>• Bạn có thể hủy hoặc thay đổi lịch hẹn trước 24 giờ.</li>
                  <li>• Thời gian hoàn thành dịch vụ có thể thay đổi tùy thuộc vào tình trạng xe.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer với các nút điều hướng */}
        <div className="p-6 bg-gray-50 border-t flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={handlePrevStep}
            >
              Quay lại
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              className={`px-6 py-2 rounded-lg text-white ${canProceed() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
              onClick={handleNextStep}
              disabled={!canProceed()}
            >
              Tiếp tục
            </button>
          ) : (
            <button
              type="button"
              className={`px-6 py-2 rounded-lg text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}