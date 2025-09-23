"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Car, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo and About */}
          <div className="space-y-5">
            <div className="flex items-center">
              <div className="relative w-20 h-20">
                <Image
                  src="/gr_logo.png"
                  alt="Garage Pro Logo"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <h3 className="text-2xl font-bold ml-3">Garage Pro</h3>
            </div>

            <p className="text-gray-400 text-base">
              We provide high-quality car repair and maintenance services with a team of professional technicians.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/customer" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/customer/services" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/customer/vehicles" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  My Vehicles
                </Link>
              </li>
              <li>
                <Link href="/customer/repairs" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Repairs
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-semibold mb-5">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/customer/services/maintenance" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Routine Maintenance
                </Link>
              </li>
              <li>
                <Link href="/customer/services/repair" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Repair
                </Link>
              </li>
              <li>
                <Link href="/customer/services/emergency" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Emergency Services
                </Link>
              </li>
              <li>
                <Link href="/customer/services/appointments" className="text-gray-400 hover:text-blue-400 text-base font-medium transition duration-150">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-6 w-6 text-red-400 mr-3 mt-1" />
                <span className="text-gray-400 text-base">123 Nguyen Van Linh Street, District 7, HCM City</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-6 w-6 text-red-400 mr-3" />
                <span className="text-gray-400 text-base">+84 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-6 w-6 text-red-400 mr-3" />
                <span className="text-gray-400 text-base">contact@garagepro.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-5 mb-5 md:mb-0">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-150">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-150">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-150">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition duration-150">
              <Youtube className="h-6 w-6" />
            </a>
          </div>
          <p className="text-gray-500 text-base">
            © {new Date().getFullYear()} Garage Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
