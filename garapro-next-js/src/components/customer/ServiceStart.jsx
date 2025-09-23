"use client";

import Image from "next/image";
import { Car, Cog,  Fuel , Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: 1,
    title: "Diagnostic Test",
    icon: <Car className="w-8 h-8 text-primary" />,
    image: "/images/service-1.jpg",
    description:
      "Comprehensive computer diagnostics to quickly identify issues with your vehicle’s engine, transmission, brakes, and electronics.",
    features: [
      "Accurate problem detection",
      "Advanced diagnostic tools",
      "Save time & repair costs",
    ],
  },
  {
    id: 2,
    title: "Engine Servicing",
    icon: <Wrench className="w-8 h-8 text-primary" />,
    image: "/images/service-2.jpg",
    description:
      "Professional engine maintenance including cleaning, tuning, and part replacement to keep your car running at peak performance.",
    features: [
      "Engine inspection & tuning",
      "Replacement of worn-out parts",
      "Improved fuel efficiency",
    ],
  },
  {
    id: 3,
    title: "Tire Replacement",
    icon: <Cog className="w-8 h-8 text-primary" />,
    image: "/images/service-3.jpg",
    description:
      "High-quality tire replacement and balancing services to ensure maximum safety and driving comfort in all conditions.",
    features: [
      "Wide range of tire brands",
      "Wheel alignment & balancing",
      "Enhanced road safety",
    ],
  },
  {
    id: 4,
    title: "Oil Change",
    icon: <Fuel className="w-8 h-8 text-primary" />,
    image: "/images/service-4.jpg",
    description:
      "Regular oil changes to extend the life of your engine, reduce wear, and improve overall performance.",
    features: [
      "High-grade engine oils",
      "Quick & efficient service",
      "Better engine protection",
    ],
  },
];

export default function ServicesSection() {
  const [active, setActive] = useState(1);

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h6 className="text-red-600 font-semibold mb-2">// Our Services //</h6>
        <h1 className="text-3xl font-bold">Explore Our Services</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setActive(service.id)}
              className={`flex items-center text-left p-4 rounded-xl border transition 
                ${
                  active === service.id
                    ? "bg-primary text-white shadow"
                    : "bg-white hover:bg-gray-100"
                }`}
            >
              {service.icon}
              <h4 className="ml-3 text-lg font-semibold">{service.title}</h4>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          {services.map(
            (service) =>
              active === service.id && (
                <div
                  key={service.id}
                  className="grid md:grid-cols-2 gap-6 items-center"
                >
                  <div className="relative w-full h-[350px]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      15 Years Of Experience In Auto Servicing
                    </h3>
                    <p className="mb-4 text-gray-600">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center text-gray-700"
                        >
                          <span className="text-green-500 mr-2">✔</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4">
                      Read More
                      <span className="ml-2">→</span>
                    </Button>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
