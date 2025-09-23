"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';

// Fake data - easily replaceable with API calls
const fakeData = {
  vehicleBrands: [
    { id: 'vinfast', name: 'VinFast', country: 'Vietnam' },
    { id: 'toyota', name: 'Toyota', country: 'Japan' },
    { id: 'honda', name: 'Honda', country: 'Japan' },
    { id: 'hyundai', name: 'Hyundai', country: 'South Korea' },
    { id: 'kia', name: 'Kia', country: 'South Korea' },
    { id: 'mazda', name: 'Mazda', country: 'Japan' },
    { id: 'ford', name: 'Ford', country: 'USA' },
    { id: 'chevrolet', name: 'Chevrolet', country: 'USA' },
    { id: 'bmw', name: 'BMW', country: 'Germany' },
    { id: 'mercedes', name: 'Mercedes-Benz', country: 'Germany' },
    { id: 'audi', name: 'Audi', country: 'Germany' },
    { id: 'volkswagen', name: 'Volkswagen', country: 'Germany' }
  ],
  
  vehicleModels: [
    // VinFast
    { id: 'FADIL', name: 'FADIL', type: 'Car', brandId: 'vinfast' },
    { id: 'LUX-A', name: 'LUX A2.0', type: 'Car', brandId: 'vinfast' },
    { id: 'LUX-SA', name: 'LUX SA2.0', type: 'Car', brandId: 'vinfast' },
    { id: 'VF3', name: 'VF 3', type: 'eCar', brandId: 'vinfast' },
    { id: 'VF5', name: 'VF 5', type: 'eCar', brandId: 'vinfast' },
    { id: 'VF6', name: 'VF 6', type: 'eCar', brandId: 'vinfast' },
    { id: 'VF7', name: 'VF 7', type: 'eCar', brandId: 'vinfast' },
    { id: 'VF8', name: 'VF 8', type: 'eCar', brandId: 'vinfast' },
    { id: 'VF9', name: 'VF 9', type: 'eCar', brandId: 'vinfast' },
    
    // Toyota
    { id: 'camry', name: 'Camry', type: 'Car', brandId: 'toyota' },
    { id: 'corolla', name: 'Corolla', type: 'Car', brandId: 'toyota' },
    { id: 'vios', name: 'Vios', type: 'Car', brandId: 'toyota' },
    { id: 'innova', name: 'Innova', type: 'Car', brandId: 'toyota' },
    
    // Honda
    { id: 'civic', name: 'Civic', type: 'Car', brandId: 'honda' },
    { id: 'accord', name: 'Accord', type: 'Car', brandId: 'honda' },
    { id: 'city', name: 'City', type: 'Car', brandId: 'honda' },
    { id: 'crv', name: 'CR-V', type: 'Car', brandId: 'honda' },
    
    // Hyundai
    { id: 'elantra', name: 'Elantra', type: 'Car', brandId: 'hyundai' },
    { id: 'accent', name: 'Accent', type: 'Car', brandId: 'hyundai' },
    { id: 'tucson', name: 'Tucson', type: 'Car', brandId: 'hyundai' },
    { id: 'santafe', name: 'Santa Fe', type: 'Car', brandId: 'hyundai' }
  ],
  
  timeSlots: [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
  ],

  cities: [
    { id: 'hanoi', name: 'Hanoi' },
    { id: 'hcm', name: 'Ho Chi Minh City' },
    { id: 'danang', name: 'Da Nang' },
    { id: 'haiphong', name: 'Hai Phong' },
    { id: 'cantho', name: 'Can Tho' }
  ],

  districts: {
    hanoi: [
      { id: 'ba-dinh', name: 'Ba Dinh' },
      { id: 'hoan-kiem', name: 'Hoan Kiem' },
      { id: 'hai-ba-trung', name: 'Hai Ba Trung' },
      { id: 'dong-da', name: 'Dong Da' }
    ],
    hcm: [
      { id: 'district-1', name: 'District 1' },
      { id: 'district-2', name: 'District 2' },
      { id: 'district-3', name: 'District 3' },
      { id: 'district-7', name: 'District 7' }
    ],
    danang: [
      { id: 'hai-chau', name: 'Hai Chau' },
      { id: 'thanh-khe', name: 'Thanh Khe' },
      { id: 'son-tra', name: 'Son Tra' },
      { id: 'ngu-hanh-son', name: 'Ngu Hanh Son' }
    ]
  },

  showrooms: {
    hanoi: [
      { id: 'hanoi-showroom-1', name: 'VinFast Hanoi - Ba Dinh', address: '123 Nguyen Thai Hoc, Ba Dinh' },
      { id: 'hanoi-showroom-2', name: 'VinFast Hanoi - Dong Da', address: '456 Lang Ha, Dong Da' }
    ],
    hcm: [
      { id: 'hcm-showroom-1', name: 'VinFast HCM - District 1', address: '789 Nguyen Hue, District 1' },
      { id: 'hcm-showroom-2', name: 'VinFast HCM - District 7', address: '321 Nguyen Van Linh, District 7' }
    ],
    danang: [
      { id: 'danang-showroom-1', name: 'VinFast Da Nang - Hai Chau', address: '147 Tran Phu, Hai Chau' },
      { id: 'danang-showroom-2', name: 'VinFast Da Nang - Son Tra', address: '258 Vo Nguyen Giap, Son Tra' }
    ]
  },

  serviceCategories: {
    maintenance: {
      id: '3',
      name: 'Maintenance',
      subcategories: {
        minor: {
          id: '3A',
          name: 'Minor Periodic Maintenance',
          items: ['Engine Oil', 'Oil Filter', 'Air Filter', 'Spark Plugs', 'Fuel Filter', 'A/C Filter', 'Brake Fluid', 'Transmission Oil', 'Coolant', 'Wiper Blades', 'Drive Belt', 'Wiper Arms']
        },
        medium: {
          id: '3B',
          name: 'Medium Periodic Maintenance',
          items: ['Engine Oil', 'Oil Filter', 'Air Filter', 'Spark Plugs', 'Fuel Filter', 'A/C Filter', 'Brake Fluid', 'Transmission Oil', 'Coolant', 'Wiper Blades', 'Drive Belt', 'Wiper Arms']
        },
        major: {
          id: '3C',
          name: 'Major Periodic Maintenance',
          items: ['Engine Oil', 'Oil Filter', 'Air Filter', 'Spark Plugs', 'Fuel Filter', 'A/C Filter', 'Brake Fluid', 'Transmission Oil', 'Coolant', 'Wiper Blades', 'Drive Belt', 'Wiper Arms']
        }
      }
    },
    repair: {
      id: '1',
      name: 'General Repair',
      subcategories: {
        brake: {
          id: '1A',
          name: 'Brake System',
          items: ['Brake Pads', 'ABS Sensors', 'Brake Disc Repair/Replacement', 'Parking Brake', 'Brake Assembly']
        },
        steering: {
          id: '1B',
          name: 'Steering System',
          items: ['Steering Wheel', 'Power Steering', 'Steering Rack', 'Power Steering Pump', 'Steering Column']
        },
        electrical: {
          id: '1C',
          name: 'Electrical & A/C System',
          items: ['Horn', 'Battery', 'Evaporator Temperature Sensor', 'Condenser', 'High Pressure Line', 'A/C Vents', 'A/C Fan Motor']
        },
        cooling: {
          id: '1D',
          name: 'Cooling System',
          items: ['Radiator', 'Cooling Fan', 'High Pressure Line', 'Thermostat']
        },
        suspension: {
          id: '1E',
          name: 'Suspension/Chassis System',
          items: ['Tire Repair', 'Tire/Rim Replacement', 'Spare Tire Replacement', 'Tire Pressure Sensor', 'Shock Absorber']
        },
        interior: {
          id: '1F',
          name: 'Interior System',
          items: ['Interior Plastic Trim Replacement']
        }
      }
    },
    painting: {
      id: '2',
      name: 'Body & Paint',
      subcategories: {
        replacement: {
          id: '2A',
          name: 'Body Parts Replacement',
          items: ['Lights: Headlight, Tail Light, Brake Light, Turn Signal, Fog Light', 'Side Mirrors', 'Vehicle Logo', 'Window Control Switches', 'Door/Frame Seals', 'Windshield: Front/Rear', 'Door Glass: Front/Rear']
        },
        painting: {
          id: '2B',
          name: 'Paint Restoration',
          items: ['Scratch Repair', 'Dent/Ding Repair']
        }
      }
    }
  }
};

// API simulation functions - replace these with actual API calls
const fetchVehicleBrands = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/vehicle-brands', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data; // Expected: [{ id, name, country }, ...]
    
  } catch (error) {
    console.error('Error fetching vehicle brands:', error);
    // Fallback to fake data if API fails
    return fakeData.vehicleBrands;
  }
};

const fetchVehicleModels = async (brandId = null) => {
  try {
    // Replace with your actual API endpoint
    let url = '/api/vehicle-models';
    if (brandId) {
      url += `?brandId=${brandId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data; // Expected: [{ id, name, type, brandId }, ...]
    
  } catch (error) {
    console.error('Error fetching vehicle models:', error);
    // Fallback to fake data if API fails
    if (brandId) {
      return fakeData.vehicleModels.filter(model => model.brandId === brandId);
    }
    return fakeData.vehicleModels;
  }
};

const fetchAllVehicleBrands = async () => {
  try {
    // Alternative endpoint for getting all brands with their models
    const response = await fetch('/api/vehicles/brands-with-models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data; // Expected: [{ brand: {...}, models: [...] }, ...]
    
  } catch (error) {
    console.error('Error fetching all vehicle brands:', error);
    // Fallback to fake data
    const brands = fakeData.vehicleBrands.map(brand => ({
      brand: brand,
      models: fakeData.vehicleModels.filter(model => model.brandId === brand.id)
    }));
    return brands;
  }
};

const fetchCities = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return fakeData.cities;
};

const fetchDistrictsByCity = async (cityId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return fakeData.districts[cityId] || [];
};

const fetchShowroomsByCity = async (cityId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return fakeData.showrooms[cityId] || [];
};

const fetchTimeSlots = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return fakeData.timeSlots;
};

const fetchServiceCategories = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return fakeData.serviceCategories;
};

const ServiceBookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleBrand: '',
    productModel: '',
    licensePlate: '',
    serviceMethod: '',
    city: '',
    district: '',
    showRoom: '',
    address: '',
    scheduleDate: '',
    scheduleTime: '',
    description: '',
    services: [],
    consent: false
  });

  // State for dynamic data
  const [vehicleBrands, setVehicleBrands] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [serviceCategories, setServiceCategories] = useState({});
  const [loading, setLoading] = useState(false);

  const [expandedServices, setExpandedServices] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [brandsData, citiesData, timeSlotsData, servicesData] = await Promise.all([
          fetchVehicleBrands(),
          fetchCities(),
          fetchTimeSlots(),
          fetchServiceCategories()
        ]);
        
        setVehicleBrands(brandsData);
        setCities(citiesData);
        setTimeSlots(timeSlotsData);
        setServiceCategories(servicesData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load vehicle models when brand changes
  useEffect(() => {
    const loadVehicleModels = async () => {
      if (formData.vehicleBrand) {
        const modelsData = await fetchVehicleModels(formData.vehicleBrand);
        setVehicleModels(modelsData);
        // Reset product model when brand changes
        setFormData(prev => ({ ...prev, productModel: '' }));
      } else {
        setVehicleModels([]);
      }
    };

    loadVehicleModels();
  }, [formData.vehicleBrand]);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.city) {
        const districtsData = await fetchDistrictsByCity(formData.city);
        setDistricts(districtsData);
        // Reset district when city changes
        setFormData(prev => ({ ...prev, district: '', showRoom: '' }));
      } else {
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [formData.city]);

  // Load showrooms when city changes
  useEffect(() => {
    const loadShowrooms = async () => {
      if (formData.city && formData.serviceMethod === 'SHOWROOM') {
        const showroomsData = await fetchShowroomsByCity(formData.city);
        setShowrooms(showroomsData);
      } else {
        setShowrooms([]);
      }
    };

    loadShowrooms();
  }, [formData.city, formData.serviceMethod]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleServiceSelection = (serviceId, checked) => {
    setFormData(prev => ({
      ...prev,
      services: checked
        ? [...prev.services, serviceId]
        : prev.services.filter(id => id !== serviceId)
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (uploadedFiles.length + files.length > 5) {
      alert('Maximum 5 files allowed!');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds limit!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFiles(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          url: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          uploadedFiles: uploadedFiles
        })
      });

      if (response.ok) {
        console.log('Form submitted successfully:', formData);
        // Handle success (redirect, show success message, etc.)
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.phone && formData.email &&
    formData.vehicleBrand && formData.productModel && formData.licensePlate &&
    formData.serviceMethod && formData.city && formData.district &&
    formData.scheduleDate && formData.scheduleTime && formData.consent;

  if (loading && vehicleBrands.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold text-center text-blue-900">Schedule Service Appointment</h2>
      </div>

      <div className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  maxLength={80}
                  className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {formData.name.length}/80
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Minimum 10 digits"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@gmail.com"
                maxLength={80}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h3 className="text-lg font-semibold">Vehicle Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Brand *</label>
              <select
                value={formData.vehicleBrand}
                onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Brand</option>
                {vehicleBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vehicle Model *</label>
              <select
                value={formData.productModel}
                onChange={(e) => handleInputChange('productModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.vehicleBrand}
                required
              >
                <option value="">Select Model</option>
                {vehicleModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">License Plate *</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                placeholder="Enter license plate number"
                maxLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h3 className="text-lg font-semibold">Services</h3>
            </div>

            <div className="space-y-3">
              {Object.entries(serviceCategories).map(([key, category]) => (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleServiceExpansion(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(category.id)}
                        onChange={(e) => handleServiceSelection(category.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedServices[category.id] ? 'rotate-180' : ''}`} />
                  </div>

                  {expandedServices[category.id] && (
                    <div className="px-6 pb-3 space-y-2">
                      {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                        <div key={subcategory.id}>
                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              checked={formData.services.includes(subcategory.id)}
                              onChange={(e) => handleServiceSelection(subcategory.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{subcategory.name}</span>
                          </div>
                          <div className="ml-6 grid grid-cols-1 gap-1">
                            {subcategory.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="w-3 h-3 text-blue-600"
                                />
                                <span className="text-xs text-gray-600">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Specify Garapro support requirements"
                maxLength={255}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location and Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <h3 className="text-lg font-semibold">Location and Schedule</h3>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Province/City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>

                <select
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.city}
                >
                  <option value="">District</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="serviceMethod"
                      value="SHOWROOM"
                      checked={formData.serviceMethod === 'SHOWROOM'}
                      onChange={(e) => handleInputChange('serviceMethod', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Service Center</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="serviceMethod"
                      value="MBS"
                      checked={formData.serviceMethod === 'MBS'}
                      onChange={(e) => handleInputChange('serviceMethod', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Mobile Service</span>
                  </label>
                </div>

                {formData.serviceMethod === 'SHOWROOM' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Showroom</label>
                    <select
                      value={formData.showRoom}
                      onChange={(e) => handleInputChange('showRoom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.city}
                    >
                      <option value="">Select Showroom</option>
                      {showrooms.map(showroom => (
                        <option key={showroom.id} value={showroom.id}>
                          {showroom.name} - {showroom.address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.serviceMethod === 'MBS' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Specific Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter service location address"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <MapPin className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="mb-1">For convenient service, please select a location that meets the following conditions:</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>Flat terrain with adequate space for technician operations.</li>
                        <li>Access to 220V power source.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Schedule *</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <select
                  value={formData.scheduleTime}
                  onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time.split(' - ')[0]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Upload Images ({uploadedFiles.length}/5)</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-200">
                  <Plus className="w-6 h-6" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="relative">
                      <img src={file.url} alt={file.name} className="w-16 h-16 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Submit */}
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={formData.consent}
              onChange={(e) => handleInputChange('consent', e.target.checked)}
              className="w-4 h-4 mt-1 text-blue-600"
              required
            />
            <label className="text-sm text-gray-600">
              I agree to allow GaraPro and Service Co., Ltd. to process my personal data and other information I provide for the purposes and in the manner described in detail in the{' '}
              <a href="#" className="text-blue-600 underline">Personal Data Protection Policy</a>.
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            {/* Cancel Link */}
            <Link
              href="/customer/repairs"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              onClick={handleSubmit}
              className={`px-8 py-3 rounded-lg font-medium ${isFormValid && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingForm;