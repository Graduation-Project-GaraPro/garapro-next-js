import React from "react";
import ServiceBookingForm from "@/components/customer/ServiceBookingForm";
export default function RepairRequest({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ServiceBookingForm />
      {children}
    </div>
  );
}
