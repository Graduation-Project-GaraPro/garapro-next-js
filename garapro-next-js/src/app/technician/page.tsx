"use client";

import { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Image from "next/image";

export default function TechnicianHomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/images/image1.jpg",
    "/images/image2.jpg",
    "/images/image3.jpg",
    "/images/image4.jpg",
  ];

  // Tự động chuyển ảnh mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Hàm điều hướng ảnh
  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="space-y-3 max-h-[85vh] overflow-y-auto rounded-2xl">

      {/* Welcome Section */}
      <div className="bg-white px-10 py-3 rounded-lg shadow-md mb-2 ">
        <h3 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">GaragePro Technician Portal</h3>
        <p className="text-gray-600 mb-2 italic">
          Access all your tools and information to provide the best service for our customers.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
          <div className="bg-blue-50 p-2 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900">Quick Access</h4>
            <p className="text-sm text-blue-700">Navigate through your daily tasks efficiently</p>
          </div>
          
          <div className="bg-green-50 p-2 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-900">Track Progress</h4>
            <p className="text-sm text-green-700">Monitor your work and completed repairs</p>
          </div>
          
          <div className="bg-orange-50 p-2 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-900">Parts Management</h4>
            <p className="text-sm text-orange-700">Check inventory and request parts</p>
          </div>
          
          <div className="bg-purple-50 p-2 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-900">Vehicle History</h4>
            <p className="text-sm text-purple-700">Access complete repair records</p>
          </div>
        </div>
      </div>

      {/* <div className="relative w-full h-[406px] overflow-hidden rounded-lg"> */}
      <div className="relative w-full h-[460px] overflow-hidden rounded-lg">
        {images.map((image, index) => (
        <div
          key={index}
           className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
          index === currentImageIndex ? "opacity-100" : "opacity-0"
           }`}
         >
       <Image
           src={image}
           alt={`Slide ${index + 1}`}
           fill
           priority={index === 0} // load nhanh ảnh đầu tiên
           sizes="200vw"
           className="object-cover"
          onError={() => {
           console.warn(`Image ${index + 1} failed to load.`);
        }}
         />
        </div>
       ))}
        
        <div className="absolute top-30 left-15 z-20">
          <h2 className="text-4xl font-semibold text-white italic font-serif leading-tight drop-shadow-lg">
            <div>Your Car, Our Care</div>
            <div className="ml-10">GaragePro Technicians</div>
          </h2>
        </div>
        
        <button
          onClick={goToPreviousImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          <FaArrowLeft />
        </button>
        
        <button
          onClick={goToNextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          <FaArrowRight />
        </button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}