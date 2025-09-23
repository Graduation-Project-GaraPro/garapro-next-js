"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    bg: "/images/carousel-bg-1.jpg",
    title: "Qualified Car Repair Service Center",
    subtitle: "// Car Servicing //",
    img: "/images/carousel-1.png",
  },
  {
    id: 2,
    bg: "/images/carousel-bg-2.jpg",
    title: "Qualified Car Wash Service Center",
    subtitle: "// Car Servicing //",
    img: "/images/carousel-2.png",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto change slide after 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background */}
          <Image
            src={slide.bg}
            alt="Carousel Background"
            fill
            className="object-cover"
            priority
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center md:justify-start px-6 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
              <div className="text-center md:text-left text-white">
                <h6 className="text-red-400 text-lg font-semibold mb-3 animate-slideInDown">
                  {slide.subtitle}
                </h6>
                <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-slideInDown">
                  {slide.title}
                </h1>
                <a
                  href="#"
                  className="inline-block bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-white font-semibold transition animate-slideInDown"
                >
                  Learn More →
                </a>
              </div>
              <div className="hidden md:flex justify-center animate-zoomIn">
                <Image
                  src={slide.img}
                  alt="Carousel Image"
                  width={500}
                  height={400}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full hover:bg-black/60 text-white z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() =>
          setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full hover:bg-black/60 text-white z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
