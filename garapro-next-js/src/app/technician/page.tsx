"use client";

import { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Image from "next/image";

export default function TechnicianHomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const images = [
    "/images/image1.jpg",
    "/images/image2.jpg",
    "/images/image3.jpg",
    "/images/image4.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="space-y-3 md:space-y-4 max-h-[85vh] overflow-y-auto rounded-2xl">

      <div className="bg-white px-4 md:px-8 lg:px-10 py-3 md:py-4 rounded-lg shadow-md mb-2">
        <h3 className="text-xl md:text-2xl lg:text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
          GaragePro Technician Portal
        </h3>
        <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base italic">
          Access all your tools and information to provide the best service for our customers.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 text-sm md:text-base">Quick Access</h4>
            <p className="text-xs md:text-sm text-blue-700 mt-1">
              Navigate through your daily tasks efficiently
            </p>
          </div>
          
          <div className="bg-green-50 p-3 md:p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-900 text-sm md:text-base">Track Progress</h4>
            <p className="text-xs md:text-sm text-green-700 mt-1">
              Monitor your work and completed repairs
            </p>
          </div>
          
          <div className="bg-orange-50 p-3 md:p-4 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-900 text-sm md:text-base">Parts Management</h4>
            <p className="text-xs md:text-sm text-orange-700 mt-1">
              Check inventory and request parts
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 md:p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-900 text-sm md:text-base">Vehicle History</h4>
            <p className="text-xs md:text-sm text-purple-700 mt-1">
              Access complete repair records
            </p>
          </div>
        </div>
      </div>

      {/* Slider với height responsive */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden rounded-lg">
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
              priority={index === 0}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              onError={() => {
                console.warn(`Image ${index + 1} failed to load.`);
              }}
            />
          </div>
        ))}
        
        {/* Text overlay - ẩn trên mobile nhỏ */}
        <div className={`absolute z-20 ${isMobile ? 'hidden' : 'top-8 left-8 md:top-12 md:left-12'}`}>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white italic font-serif leading-tight drop-shadow-lg">
            <div>Your Car, Our Care</div>
            <div className="mt-2 md:mt-4 lg:ml-10">GaragePro Technicians</div>
          </h2>
        </div>
        
        {/* Navigation buttons - ẩn trên mobile */}
        <button
          onClick={goToPreviousImage}
          className="hidden sm:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          aria-label="Previous image"
        >
          <FaArrowLeft />
        </button>
        
        <button
          onClick={goToNextImage}
          className="hidden sm:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          aria-label="Next image"
        >
          <FaArrowRight />
        </button>
        
        {/* Dots indicator - thu nhỏ trên mobile */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-white" : "bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Mobile touch navigation */}
        <div className="block sm:hidden absolute inset-0" style={{ touchAction: 'pan-y' }}>
          <div 
            className="absolute left-0 top-0 w-1/3 h-full"
            onClick={goToPreviousImage}
          />
          <div 
            className="absolute right-0 top-0 w-1/3 h-full"
            onClick={goToNextImage}
          />
        </div>
      </div>
    </div>
  );
}