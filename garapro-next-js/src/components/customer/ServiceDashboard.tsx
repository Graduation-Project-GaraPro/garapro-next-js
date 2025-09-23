"use client";

import { Award, UserCog, Wrench } from "lucide-react"; 
import Link from "next/link";

export default function ServicesDashboard() {
  const items = [
  {
    id: 1,
    icon: <Award className="w-12 h-12 text-red-600" />,
    title: "Premium Service Quality",
    desc: "We deliver top-notch car servicing with attention to detail, ensuring your vehicle runs smoothly and safely.",
    delay: "0.1s",
  },
  {
    id: 2,
    icon: <UserCog className="w-12 h-12 text-red-600" />,
    title: "Skilled & Certified Technicians",
    desc: "Our team consists of highly trained professionals with years of experience in automotive care and repair.",
    delay: "0.3s",
    bg: "bg-gray-50",
  },
  {
    id: 3,
    icon: <Wrench className="w-12 h-12 text-red-600" />,
    title: "Advanced Tools & Equipment",
    desc: "We use the latest diagnostic tools and modern equipment to provide fast, accurate, and reliable repairs.",
    delay: "0.5s",
  },
];


  return (
    <div className="container mx-auto py-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start py-8 px-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 ${
              item.bg || "bg-white"
            } animate-fadeInUp`}
            style={{ animationDelay: item.delay }}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <div className="ml-6">
              <h5 className="text-lg font-semibold mb-2">{item.title}</h5>
              <p className="text-gray-600 mb-3">{item.desc}</p>
              <Link
                href="#"
                className="text-red-600 border-b border-red-600 hover:text-red-800 transition"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
