"use client";

import { useState, useEffect } from "react";
import {
  Car,
  Wrench,
  CheckCircle,
  Calendar,
  Star,
  FileText,
  ChevronRight,
  PlusCircle,
  X,
  ArrowRight,
  MessageSquare,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Hero from "@/components/customer/Hero";
import ServiceDashboard from "@/components/customer/ServiceDashboard";
import AboutUsSection from "@/components/customer/AboutUsSection";
import ServiceStart from "@/components/customer/ServiceStart";
import BookingSection from "@/components/customer/BookingSection";
import Footer from "@/components/customer/Footer"
import TestimonialCarousel from "@/components/customer/TestimonialCarousel"

export default function Dashboard() {
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate adding a new repair request
    const newRequest = {
      id: repairRequests.length + 1,
      vehicle: formData.vehicle,
      issue: formData.issue,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      priority: formData.priority,
    };
    setRepairRequests([...repairRequests, newRequest]);
    setShowForm(false);
    setFormData({
      vehicle: "",
      licensePlate: "",
      issue: "",
      priority: "medium",
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <>
      <Hero />
      <ServiceDashboard/>
      <AboutUsSection/>
      <ServiceStart/>
      {/* <BookingSection/> */}
      <TestimonialCarousel/>
      <Footer/>
     
    </>
  );
}