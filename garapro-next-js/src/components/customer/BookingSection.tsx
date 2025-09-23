"use client";

import { useState } from "react";

export default function BookingSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    date: "",
    request: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-bold mb-6">
              Certified and Award Winning Car Repair Service Provider
            </h1>
            <p className="text-white leading-relaxed">
              Eirmod sed tempor lorem ut dolores. Aliquyam sit sadipscing kasd
              ipsum. Dolor ea et dolore et at sea ea at dolor, justo ipsum duo
              rebum sea invidunt voluptua. Eos vero eos vero ea et dolore eirmod
              et. Dolores diam duo invidunt lorem. Elitr ut dolores magna sit.
              Sea dolore sanctus sed et. Takimata takimata sanctus sed.
            </p>
          </div>

          {/* Right form */}
          <div className="bg-blue-600 p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-white text-2xl font-bold mb-6">
              Book For A Service
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select A Service</option>
                  <option value="1">Service 1</option>
                  <option value="2">Service 2</option>
                  <option value="3">Service 3</option>
                </select>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <textarea
                name="request"
                placeholder="Special Request"
                value={formData.request}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-blue-400"
                rows={4}
              />

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition"
              >
                Book Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
