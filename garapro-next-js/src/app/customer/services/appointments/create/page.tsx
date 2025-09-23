"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Car,
  Wrench,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { validateSelectField, validateTextField } from "@/utils/validate/formValidation";

/**
 * Fully corrected and self-contained CreateAppointmentPage component.
 * - Fixed all IDs to use integers instead of strings
 * - Added missing togglePartSelection function
 * - Fixed parts structure in services
 * - All UI text converted to English
 * - Keeps the original 4-step flow (select service, vehicle info, date/time & branch, confirmation)
 */

/* ---- Types ---- */
interface ServicePart {
  id: number;
  name: string;
  price: number;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: string;
  category: string;
  parts: ServicePart[];
}

interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
}

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

interface VehicleBrand {
  id: number;
  name: string;
}

interface VehicleModel {
  id: number;
  brandId: number;
  name: string;
}

interface SavedVehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
}

/* ---- Component ---- */
export default function CreateAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedServiceId = parseInt(searchParams.get("service") || "0") || 0;
  const preSelectedPartsParam = searchParams.get("parts") || "";
  const preSelectedParts = preSelectedPartsParam ? preSelectedPartsParam.split(",").map(id => parseInt(id)) : [];
  const [selectedParts, setSelectedParts] = useState<number[]>(preSelectedParts);

  // Step & flow
  const [step, setStep] = useState<number>(preSelectedServiceId > 0 ? 1 : 1);

  // Appointment selections
  const [selectedService, setSelectedService] = useState<number>(preSelectedServiceId);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  
  // Saved vehicles data
  const savedVehicles: SavedVehicle[] = [
    {
      id: 1,
      brand: "Toyota",
      model: "Camry",
      year: "2020",
      licensePlate: "51F-123.45",
    },
    {
      id: 2,
      brand: "Honda",
      model: "Civic",
      year: "2019",
      licensePlate: "59F-678.90",
    },
  ];

  // Vehicle information
  const [vehicleBrand, setVehicleBrand] = useState<number>(0);
  const [vehicleModel, setVehicleModel] = useState<number>(0);
  const [vehicleYear, setVehicleYear] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [useExistingVehicle, setUseExistingVehicle] = useState<boolean>(true);
  const [selectedSavedVehicle, setSelectedSavedVehicle] = useState<number>(0);

  // UI dropdown toggles
  const [servicesOpen, setServicesOpen] = useState<boolean>(false);
  const [branchesOpen, setBranchesOpen] = useState<boolean>(false);

  // submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /* ---- Fake / hardcoded data ---- */
  const services: Service[] = [
    { 
      id: 1, 
      name: "Routine Maintenance", 
      price: 800000, 
      duration: "2-3 hours", 
      category: "maintenance",
      parts: [
        { id: 1, name: "Engine Oil Filter", price: 150000 },
        { id: 2, name: "Air Filter", price: 200000 },
        { id: 3, name: "Spark Plugs", price: 300000 }
      ]
    },
    { 
      id: 2, 
      name: "Engine Oil Change", 
      price: 350000, 
      duration: "30-45 minutes", 
      category: "maintenance",
      parts: [
        { id: 4, name: "Premium Oil Filter", price: 120000 },
        { id: 5, name: "Synthetic Oil", price: 180000 }
      ]
    },
    { 
      id: 3, 
      name: "Brake Inspection & Repair", 
      price: 600000, 
      duration: "1-2 hours", 
      category: "repair",
      parts: [
        { id: 6, name: "Brake Pads", price: 450000 },
        { id: 7, name: "Brake Fluid", price: 100000 },
        { id: 8, name: "Brake Discs", price: 800000 }
      ]
    },
    { 
      id: 4, 
      name: "Wheel Alignment", 
      price: 450000, 
      duration: "1 hour", 
      category: "maintenance",
      parts: [
        { id: 9, name: "Alignment Kit", price: 200000 }
      ]
    },
    { 
      id: 5, 
      name: "AC Inspection & Repair", 
      price: 750000, 
      duration: "1-3 hours", 
      category: "repair",
      parts: [
        { id: 10, name: "AC Filter", price: 150000 },
        { id: 11, name: "Refrigerant", price: 250000 },
        { id: 12, name: "AC Compressor", price: 1200000 }
      ]
    },
  ];

  const branches: Branch[] = [
    { id: 1, name: "GaraPro Hanoi", address: "123 Duong Lang, Dong Da", city: "Hanoi", phone: "024-1234-5678" },
    { id: 2, name: "GaraPro Ho Chi Minh", address: "456 Le Loi, District 1", city: "Ho Chi Minh", phone: "028-8765-4321" },
    { id: 3, name: "GaraPro Da Nang", address: "789 Nguyen Van Linh, Hai Chau", city: "Da Nang", phone: "0236-9876-5432" },
  ];

  const vehicleBrands: VehicleBrand[] = [
    { id: 1, name: "Toyota" },
    { id: 2, name: "Honda" },
    { id: 3, name: "Ford" },
  ];

  const vehicleModels: VehicleModel[] = [
    { id: 1, brandId: 1, name: "Corolla" },
    { id: 2, brandId: 1, name: "Camry" },
    { id: 3, brandId: 1, name: "Fortuner" },
    { id: 4, brandId: 2, name: "Civic" },
    { id: 5, brandId: 2, name: "CR-V" },
    { id: 6, brandId: 2, name: "City" },
    { id: 7, brandId: 3, name: "Ranger" },
    { id: 8, brandId: 3, name: "Everest" },
  ];

  const currentYear = new Date().getFullYear();
  const vehicleYears: string[] = Array.from({ length: currentYear - 1989 }, (_, i) => `${currentYear - i}`);

  // timeslots generator (fake)
  const getTimeSlots = (): TimeSlot[] => [
    { id: 1, time: "08:00", available: true },
    { id: 2, time: "09:00", available: true },
    { id: 3, time: "10:00", available: false },
    { id: 4, time: "11:00", available: true },
    { id: 5, time: "13:30", available: true },
    { id: 6, time: "14:30", available: true },
    { id: 7, time: "15:30", available: false },
    { id: 8, time: "16:30", available: true },
  ];

  /* ---- Helper functions ---- */
  const togglePartSelection = (partId: number) => {
    setSelectedParts(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const calculateTotalPrice = () => {
    const svc = services.find((s) => s.id === selectedService);
    if (!svc) return 0;
    const partsPrice = svc.parts
      .filter((p) => selectedParts.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    return svc.price + partsPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const getDaysInMonth = (): Date[] => {
    const today = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      if (d >= startOfToday) days.push(d);
    }
    return days;
  };

  /* ---- Navigation handlers ---- */
  const handleNextStep = () => {
    if (step < 4) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo(0, 0);
    }
  };

  /* ---- Validation & submit ---- */
  const validateForm = () => {
    let isValid = true;
    const errors: Record<string, string> = {};

    const srvValidation = validateSelectField(selectedService.toString(), { required: true, label: "Service" });
    if (!srvValidation.isValid || selectedService === 0) {
      isValid = false;
      errors.service = srvValidation.error || "Please select a service";
    }

    const brandValidation = validateSelectField(vehicleBrand.toString(), { required: true, label: "Vehicle brand" });
    if (!brandValidation.isValid || vehicleBrand === 0) {
      isValid = false;
      errors.brand = brandValidation.error || "Please select a vehicle brand";
    }

    const modelValidation = validateSelectField(vehicleModel.toString(), { required: true, label: "Vehicle model" });
    if (!modelValidation.isValid || vehicleModel === 0) {
      isValid = false;
      errors.model = modelValidation.error || "Please select a vehicle model";
    }

    const yearValidation = validateTextField(vehicleYear, { required: true, label: "Manufacture year" });
    if (!yearValidation.isValid) {
      isValid = false;
      errors.year = yearValidation.error;
    }

    const plateValidation = validateTextField(licensePlate, { required: true, label: "License plate" });
    if (!plateValidation.isValid) {
      isValid = false;
      errors.plate = plateValidation.error;
    }

    if (!selectedDate) {
      isValid = false;
      errors.date = "Please select a date";
    }

    const timeValidation = validateSelectField(selectedTimeSlot.toString(), { required: true, label: "Time slot" });
    if (!timeValidation.isValid || selectedTimeSlot === 0) {
      isValid = false;
      errors.time = timeValidation.error || "Please select a time slot";
    }

    const branchValidation = validateSelectField(selectedBranch.toString(), { required: true, label: "Branch" });
    if (!branchValidation.isValid || selectedBranch === 0) {
      isValid = false;
      errors.branch = branchValidation.error || "Please select a branch";
    }

    const notesValidation = validateTextField(notes, { required: false, maxLength: 500, label: "Notes" });
    if (!notesValidation.isValid) {
      isValid = false;
      errors.notes = notesValidation.error;
    }

    return { isValid, errors };
  };

  const handleSubmit = async () => {
    const { isValid, errors } = validateForm();
    if (!isValid) {
      console.error("Validation errors:", errors);
      alert("Please check the appointment information and try again.");
      return;
    }

    setIsSubmitting(true);

    // Prepare vehicle data based on selection type
    let vehicleData;
    if (useExistingVehicle) {
      const selectedVehicle = savedVehicles.find(v => v.id === selectedSavedVehicle);
      if (selectedVehicle) {
        vehicleData = {
          id: selectedVehicle.id,
          brand: selectedVehicle.brand,
          model: selectedVehicle.model,
          year: selectedVehicle.year,
          licensePlate: selectedVehicle.licensePlate,
          isExisting: true
        };
      }
    } else {
      vehicleData = { 
        brandId: vehicleBrand, 
        modelId: vehicleModel, 
        year: vehicleYear, 
        licensePlate,
        isExisting: false
      };
    }

    // Simulate API call
    setTimeout(() => {
      console.log("Submitted appointment:", {
        serviceId: selectedService,
        selectedParts,
        vehicle: vehicleData,
        date: selectedDate?.toISOString(),
        timeSlotId: selectedTimeSlot,
        branchId: selectedBranch,
        notes,
        totalPrice: calculateTotalPrice(),
      });
      setIsSubmitting(false);
      router.push("/customer/services/appointments");
    }, 1200);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedService > 0;
      case 2:
        return useExistingVehicle
          ? selectedSavedVehicle > 0
          : (
              vehicleBrand > 0 &&
              vehicleModel > 0 &&
              vehicleYear.trim() !== "" &&
              licensePlate.trim() !== ""
            );
      case 3:
        return (
          selectedDate !== null &&
          selectedTimeSlot > 0 &&
          selectedBranch > 0
        );
      default:
        return true;
    }
  };

  /* ---- Effects ---- */
  useEffect(() => {
    if (preSelectedServiceId > 0) {
      setSelectedService(preSelectedServiceId);
    }
  }, [preSelectedServiceId]);

  useEffect(() => {
    setVehicleModel(0);
  }, [vehicleBrand]);

  /* ---- Render ---- */
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link href="/customer/services" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to services
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-6">
          <h1 className="text-2xl font-bold">Book an Appointment</h1>
          <p className="mt-2 opacity-90">Complete the steps below to book a service appointment</p>
        </div>

        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex justify-between mb-2">
            <div className="text-sm font-medium">
              Step {step}/4:{" "}
              {step === 1 ? "Select service" : step === 2 ? "Vehicle information" : step === 3 ? "Choose time & place" : "Review & confirm"}
            </div>
            <div className="text-sm text-gray-500">{step}/4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="p-6">
          {/* Step 1 - Service */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Select service</h2>

              {/* Service Select */}
              <div className="relative">
                <div
                  className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setServicesOpen((s) => !s)}
                >
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-blue-500 mr-3" />
                    {selectedService > 0 ? (
                      <span>{services.find((s) => s.id === selectedService)?.name}</span>
                    ) : (
                      <span className="text-gray-500">Choose a service</span>
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
                    {services.map((svc) => (
                      <div
                        key={svc.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedService === svc.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedService(svc.id);
                          setSelectedParts([]);
                          setServicesOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{svc.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{svc.duration}</div>
                          </div>
                          <div className="text-blue-500 font-medium">
                            {formatPrice(svc.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service details */}
              {selectedService > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium">Service details</h3>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const svc = services.find((s) => s.id === selectedService);
                      if (!svc) return null;
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service name:</span>
                            <span className="font-medium">{svc.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated duration:</span>
                            <span>{svc.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-medium text-blue-500">
                              {formatPrice(svc.price)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Parts selection */}
              {selectedService > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Select parts</h3>
                  <div className="space-y-2">
                    {services
                      .find((s) => s.id === selectedService)
                      ?.parts.map((part) => (
                        <label
                          key={part.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedParts.includes(part.id)}
                              onChange={() => togglePartSelection(part.id)}
                            />
                            <span>{part.name}</span>
                          </div>
                          <span className="text-blue-500 font-medium">
                            {formatPrice(part.price)}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Total price */}
              {selectedService > 0 && (
                <div className="mt-6 bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium">Estimated total price</h3>
                  <p className="mt-2 text-lg font-bold text-green-600">
                    {formatPrice(calculateTotalPrice())}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 - Vehicle info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-semibold">Vehicle information</h3>
              </div>
              
              {/* Vehicle selection options */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${useExistingVehicle ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setUseExistingVehicle(true)}
                >
                  Use saved vehicle
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${!useExistingVehicle ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setUseExistingVehicle(false)}
                >
                  Add new vehicle
                </button>
              </div>

              {useExistingVehicle ? (
                /* Saved vehicles selection */
                <div className="space-y-4">
                  {savedVehicles.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">Select your vehicle</label>
                      <select
                        value={selectedSavedVehicle}
                        onChange={(e) => setSelectedSavedVehicle(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Select vehicle</option>
                        {savedVehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">You don't have any saved vehicles</p>
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                        onClick={() => setUseExistingVehicle(false)}
                      >
                        Add new vehicle
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* New vehicle form */
                <div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle Brand *</label>
                    <select
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select brand</option>
                      {vehicleBrands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Vehicle Model *</label>
                    <select
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(parseInt(e.target.value) || 0)}
                      disabled={vehicleBrand === 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Select model</option>
                      {vehicleModels
                        .filter((m) => m.brandId === vehicleBrand)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Manufacture Year *</label>
                    <select
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select year</option>
                      {vehicleYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">License Plate *</label>
                    <input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="Enter license plate"
                      maxLength={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {!useExistingVehicle && vehicleBrand > 0 && vehicleModel > 0 && vehicleYear && licensePlate && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium">Vehicle details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="font-medium">{vehicleBrands.find((b) => b.id === vehicleBrand)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span>{vehicleModels.find((m) => m.id === vehicleModel)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span>{vehicleYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">License Plate:</span>
                      <span className="font-medium">{licensePlate}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {useExistingVehicle && selectedSavedVehicle > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium">Selected vehicle</h3>
                  <div className="mt-2 space-y-2">
                    {(() => {
                      const vehicle = savedVehicles.find(v => v.id === selectedSavedVehicle);
                      if (!vehicle) return null;
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Vehicle:</span>
                            <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Year:</span>
                            <span>{vehicle.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">License Plate:</span>
                            <span className="font-medium">{vehicle.licensePlate}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 - Date, time, branch */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Choose time & place</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Choose date</label>
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth().slice(0, 14).map((d) => (
                      <div
                        key={d.toISOString()}
                        className={`text-center p-2 rounded-lg cursor-pointer border ${
                          selectedDate && d.toDateString() === selectedDate.toDateString()
                            ? "bg-blue-500 text-white border-blue-500"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                        onClick={() => setSelectedDate(d)}
                      >
                        <div className="text-xs mb-1">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                        <div className="font-medium">{d.getDate()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Choose time</label>
                    <div className="grid grid-cols-4 gap-2">
                      {getTimeSlots().map((slot) => (
                        <div
                          key={slot.id}
                          className={`text-center p-3 rounded-lg cursor-pointer border ${
                            !slot.available
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : selectedTimeSlot === slot.id
                              ? "bg-blue-500 text-white border-blue-500"
                              : "hover:bg-gray-50 border-gray-200"
                          }`}
                          onClick={() => {
                            if (slot.available) setSelectedTimeSlot(slot.id);
                          }}
                        >
                          <div className="font-medium">{slot.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Select branch</label>
                  <div className="relative">
                    <div
                      className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => setBranchesOpen((s) => !s)}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                        {selectedBranch > 0 ? (
                          <span>{branches.find((b) => b.id === selectedBranch)?.name}</span>
                        ) : (
                          <span className="text-gray-500">Choose branch</span>
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
                        {branches.map((br) => (
                          <div
                            key={br.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedBranch === br.id ? "bg-blue-50" : ""}`}
                            onClick={() => {
                              setSelectedBranch(br.id);
                              setBranchesOpen(false);
                            }}
                          >
                            <div>
                              <div className="font-medium">{br.name}</div>
                              <div className="text-sm text-gray-500 mt-1">{br.address}</div>
                              <div className="text-sm text-gray-500 mt-1">{br.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Add any notes or special requests..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Review & confirm</h2>

              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                {/* Service */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <Wrench className="h-5 w-5 text-blue-500 mr-2" />
                    Service
                  </h3>
                  <div className="mt-2 pl-7">
                    {(() => {
                      const svc = services.find((s) => s.id === selectedService);
                      if (!svc) return <div className="text-gray-600">No service selected</div>;
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{svc.name}</div>
                          <div className="text-sm text-gray-600">Estimated duration: {svc.duration}</div>
                          <div className="text-blue-500 font-medium">{formatPrice(svc.price)}</div>
                          {selectedParts.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-600">Selected parts:</div>
                              {svc.parts
                                .filter(p => selectedParts.includes(p.id))
                                .map(part => (
                                  <div key={part.id} className="text-sm text-gray-600 ml-2">
                                    • {part.name} - {formatPrice(part.price)}
                                  </div>
                                ))}
                            </div>
                          )}
                          <div className="text-lg font-bold text-green-600 mt-2">
                            Total: {formatPrice(calculateTotalPrice())}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Vehicle */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <Car className="h-5 w-5 text-blue-500 mr-2" />
                    Vehicle
                  </h3>
                  <div className="mt-2 pl-7">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {vehicleBrands.find((b) => b.id === vehicleBrand)?.name || "-"}{" "}
                        {vehicleModels.find((m) => m.id === vehicleModel)?.name || ""}
                      </div>
                      <div className="text-sm text-gray-600">Manufacture year: {vehicleYear || "-"}</div>
                      <div className="text-blue-500 font-medium">{licensePlate || "-"}</div>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    Time
                  </h3>
                  <div className="mt-2 pl-7">
                    {selectedDate ? (
                      <div className="space-y-1">
                        <div className="font-medium">{formatDate(selectedDate)}</div>
                        <div className="text-blue-500">{getTimeSlots().find((s) => s.id === selectedTimeSlot)?.time || "-"}</div>
                      </div>
                    ) : (
                      <div className="text-gray-600">No date selected</div>
                    )}
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <h3 className="font-medium flex items-center">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    Branch
                  </h3>
                  <div className="mt-2 pl-7">
                    {(() => {
                      const br = branches.find((b) => b.id === selectedBranch);
                      if (!br) return <div className="text-gray-600">No branch selected</div>;
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{br.name}</div>
                          <div className="text-sm text-gray-600">{br.address}</div>
                          <div className="text-sm text-gray-600">{br.phone}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <div className="mt-2 text-gray-600">{notes}</div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800">Important</h3>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• Please arrive on time for your appointment.</li>
                  <li>• Bring vehicle registration and your driver's license.</li>
                  <li>• You can cancel or reschedule up to 24 hours before the appointment.</li>
                  <li>• Service duration may vary depending on vehicle condition.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="p-6 bg-gray-50 border-t flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg text-white ${canProceed() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isSubmitting ? "Processing..." : "Confirm Appointment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}