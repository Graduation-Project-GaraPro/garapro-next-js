import React from "react";
import CustomerLayout from "../../../components/customer/CustomerLayout";
import Footer from "../../../components/customer/Footer"

export const metadata = {
  title: "About Us - GaraPro",
  description: "Learn more about GaraPro - Your trusted auto care service provider",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayout>
    {children}
  <Footer/>
  </CustomerLayout>;
}