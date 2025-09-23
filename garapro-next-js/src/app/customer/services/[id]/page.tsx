"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Wrench,
  Search,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image: string;
}

// Category interface
interface Category {
  id: string;
  name: string;
}

export default function ServiceCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const categoryId = params.id;
  const [services, setServices] = useState<Service[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Sample categories
  const categories: Category[] = [
    { id: "1", name: "Regular Maintenance" },
    { id: "2", name: "Repairs" },
    { id: "3", name: "Inspection" },
    { id: "4", name: "Parts Replacement" },
    { id: "5", name: "Car Wash" },
  ];

  // Sample services
  const allServices: Service[] = [
    {
      id: "1",
      name: "Regular Maintenance",
      description:
        "Comprehensive inspection and maintenance of your vehicle according to manufacturer's recommended schedule.",
      price: 800000,
      duration: "2-3 hours",
      category: "1",
      image: "/images/services/maintenance.jpg",
    },
    {
      id: "2",
      name: "Engine Oil Change",
      description:
        "Replace engine oil and oil filter to ensure optimal vehicle performance.",
      price: 350000,
      duration: "30-45 minutes",
      category: "1",
      image: "/images/services/oil-change.jpg",
    },
    {
      id: "3",
      name: "Brake Inspection and Repair",
      description:
        "Comprehensive brake system inspection, brake pad replacement and adjustment if necessary.",
      price: 600000,
      duration: "1-2 hours",
      category: "2",
      image: "/images/services/brake-service.jpg",
    },
    {
      id: "4",
      name: "Wheel Alignment",
      description:
        "Balance and align wheels to reduce tire wear and improve handling.",
      price: 450000,
      duration: "1 hour",
      category: "1",
      image: "/images/services/wheel-alignment.jpg",
    },
    {
      id: "5",
      name: "AC Inspection and Repair",
      description: "Inspect, recharge gas and repair air conditioning system.",
      price: 750000,
      duration: "1-3 hours",
      category: "2",
      image: "/images/services/ac-service.jpg",
    },
  ];

  useEffect(() => {
    setLoading(true);

    // Find category name
    const category = categories.find((cat) => cat.id === categoryId);
    setCategoryName(category ? category.name : "Unknown Service");

    // Filter services
    const filteredServices = allServices.filter(
      (service) => service.category === categoryId
    );
    setServices(filteredServices);

    setLoading(false);
  }, [categoryId]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle booking service (no parts)
  const handleBookAppointment = (serviceId: string) => {
    router.push(`/customer/services/appointments/create?service=${serviceId}`);
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "1":
        return <Wrench className="h-12 w-12 text-blue-500" />;
      case "2":
        return <Wrench className="h-12 w-12 text-orange-500" />;
      case "3":
        return <Search className="h-12 w-12 text-green-500" />;
      case "4":
        return <Wrench className="h-12 w-12 text-purple-500" />;
      case "5":
        return <Wrench className="h-12 w-12 text-cyan-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          href="/customer/services"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to services</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{categoryName} Services</h1>
      <p className="text-gray-600 mb-8">
        Professional {categoryName.toLowerCase()} services for your vehicle
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {getCategoryIcon(service.category)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPrice(service.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duration: {service.duration}
                    </p>
                  </div>
                </div>

                {/* Booking button only */}
                <button
                  onClick={() => handleBookAppointment(service.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Services Found</h2>
          <p className="text-gray-600">
            There are currently no services available in this category.
          </p>
          <Link
            href="/customer/services"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            View All Services
          </Link>
        </div>
      )}
    </div>
  );
}