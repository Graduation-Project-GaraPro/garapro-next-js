"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Wrench, Users, Headphones } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 bg-black">
        <Image
          src="/images/carousel-bg-1.jpg"
          alt="Contact Banner"
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              CONTACT US
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
              <span className="text-red-500">Contact</span>
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
            <h3 className="text-xl font-semibold mb-2">Service Booking</h3>
            <p className="text-gray-600">
              Schedule your vehicle repair or maintenance service easily with
              just a few clicks. Fast, convenient, and hassle-free.
            </p>
            <Button variant="link" className="text-red-600 mt-4">
              Book Now →
            </Button>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">General Inquiries</h3>
            <p className="text-gray-600">
              Have a question about our services, pricing, or working hours?
              Contact our support team today.
            </p>
            <Button variant="link" className="text-red-600 mt-4">
              Garapro@gmail.com
            </Button>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <Headphones className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Technical Support</h3>
            <p className="text-gray-600">
              Need technical assistance or expert advice? Our specialists are
              ready to help you with any vehicle-related issues.
            </p>
            <Button variant="link" className="text-red-600 mt-4">
              +84 123 456 789
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Map */}
          <div className="w-full animate-fadeIn">
            <iframe
              className="relative rounded w-full h-full min-h-[350px] border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62652.65354512948!2d108.14717254017647!3d16.054406798948615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c79203a5db%3A0x473eb38e48d157a5!2zROG6oW4gTOG7o2MsIMSQw6AgTuG6oW5nLCBWaeG7h3QgbmFt!5e0!3m2!1sen!2s!4v1726387200000!5m2!1sen!2s"
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
            />
          </div>

          {/* Right side - Form */}
          <div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  placeholder="How can we help you?"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="Write your message here..."
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-red-500 focus:ring-red-500"
                  rows={4}
                />
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-red-600 px-4 py-3 text-white font-semibold shadow hover:bg-red-700 transition"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
