"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Wrench, Users, Wrench as Tool } from "lucide-react";
import { Clock, Smile, CheckCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import AboutUsSection from "../../../components/customer/AboutUsSection";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 bg-black">
        <Image
          src="/images/carousel-bg-1.jpg"
          alt="About Us Banner"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About Us
            </h1>
            <div className="flex items-center justify-center space-x-2 text-white">
              <Link
                href="/customer"
                className="hover:text-red-500 transition-colors"
              >
                HOME
              </Link>
              <span>/</span>
              <Link
                href="/customer/services"
                className="hover:text-red-500 transition-colors"
              >
                SERVICES
              </Link>
              <span>/</span>
              <span className="text-red-500">ABOUT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Wrench className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Servicing</h3>
            <p className="text-gray-600">
              We provide high-quality vehicle servicing and repairs with
              attention to detail, ensuring your car stays safe and reliable on
              the road.
            </p>
            <Button variant="link" className="text-red-600 mt-4">
              Read More
            </Button>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Workers</h3>
            <p className="text-gray-600">
              Our team consists of certified and experienced technicians who are
              passionate about cars and committed to delivering the best service.
            </p>
            <Button variant="link" className="text-red-600 mt-4">
              Read More
            </Button>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Tool className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Modern Equipment</h3>
            <p className="text-gray-600">
              Equipped with the latest diagnostic tools and modern technology,
              we handle everything from simple maintenance to complex repairs.
            </p>
            <Button variant="link" className="text-red-600 mt-4">
              Read More
            </Button>
          </div>
        </div>
      </div>

      {/* About Content */}
      <AboutUsSection />

      {/* Stats Section */}
      <div className="w-full bg-black bg-opacity-80 py-16 relative">
        <Image
          src="/images/about.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20 absolute inset-0"
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <Clock className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-sm">Years Experience</div>
            </div>

            <div className="text-white">
              <Users className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm">Expert Technicians</div>
            </div>

            <div className="text-white">
              <Smile className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <div className="text-4xl font-bold mb-2">2,000+</div>
              <div className="text-sm">Satisfied Clients</div>
            </div>

            <div className="text-white">
              <CheckCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-sm">Completed Projects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
