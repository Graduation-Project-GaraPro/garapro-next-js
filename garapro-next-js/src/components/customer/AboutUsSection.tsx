"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AboutUsSection() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left side - Image */}
        <div className="relative h-96 md:h-full">
          <div className="relative h-full w-full">
            <Image
              src="/images/about.jpg"
              alt="Car Service"
              fill
              className="object-cover rounded-lg"
            />
            <div className="absolute top-0 right-0 bg-red-600 text-white p-4 rounded-bl-lg">
              <div className="text-center">
                <div className="text-4xl font-bold">15</div>
                <div className="text-sm">
                  Years
                  <br />
                  Experience
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Content */}
        <div>
          <div className="text-red-600 font-semibold mb-2">// ABOUT US //</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Reliable Auto Care With 15 Years of Experience
          </h2>
          <p className="text-gray-600 mb-6">
            At <span className="font-semibold">CarServ</span>, we believe your
            vehicle deserves the best care possible. With over 15 years of
            hands-on experience, our team has helped thousands of drivers keep
            their cars running safely and smoothly. From routine maintenance to
            complex repairs, we deliver trusted solutions with honesty,
            expertise, and attention to detail.
          </p>

          <div className="space-y-4">
            {[
              {
                number: "01",
                title: "Professional & Expert Team",
                desc: "Certified mechanics and technicians who handle every vehicle with care.",
              },
              {
                number: "02",
                title: "Quality Service Guaranteed",
                desc: "We use modern tools, genuine parts, and follow industry standards.",
              },
              {
                number: "03",
                title: "Award-Winning Excellence",
                desc: "Recognized for outstanding service and customer satisfaction.",
              },
            ].map((item) => (
              <div key={item.number} className="flex items-start">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <div className="text-red-600 font-bold">{item.number}</div>
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button className="mt-8 bg-red-600 hover:bg-red-700 text-white">
            READ MORE <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
