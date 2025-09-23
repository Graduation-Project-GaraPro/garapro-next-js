// "use client";

// import { useState, useEffect } from "react";
// import {
//   Car,
//   Wrench,
//   CheckCircle,
//   Calendar,
//   Star,
//   FileText,
//   ChevronRight,
//   PlusCircle,
//   X,
//   ArrowRight,
//   MessageSquare,
//   Bell,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import Link from "next/link";
// import Hero from "@/components/customer/Hero";
// import Footer from '@/components/customer/Footer'
// import ServicesDashboard from '@/components/customer/ServicesDashboard'

// // ====== TYPE DEFINITIONS ======
// interface RepairRequest {
//   id: number;
//   vehicle: string;
//   issue: string;
//   status: "pending" | "in-progress" | "completed";
//   date: string;
//   priority: "high" | "medium" | "low";
// }

// interface Appointment {
//   id: number;
//   date: string;
//   time: string;
//   service: string;
//   vehicle: string;
// }

// interface Quotation {
//   id: number;
//   vehicle: string;
//   issue: string;
//   status: "pending" | "confirmed" | "rejected";
//   date: string;
//   totalCost: number;
// }

// export default function Dashboard() {
//   const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [quotations, setQuotations] = useState<Quotation[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState<boolean>(false);
//   const [formData, setFormData] = useState({
//     vehicle: "",
//     licensePlate: "",
//     issue: "",
//     priority: "medium",
//   });
  
//   useEffect(() => {
//     try {
//       // Simulate API call with updated dates (2025)
//       setRepairRequests([
//         {
//           id: 1,
//           vehicle: "Honda Civic 2020",
//           issue: "Động cơ kêu lạ",
//           status: "pending",
//           date: "2025-09-10",
//           priority: "high",
//         },
//         {
//           id: 2,
//           vehicle: "Toyota Camry 2019",
//           issue: "Thay dầu máy",
//           status: "in-progress",
//           date: "2025-09-08",
//           priority: "medium",
//         },
//         {
//           id: 3,
//           vehicle: "BMW X5 2021",
//           issue: "Kiểm tra phanh",
//           status: "completed",
//           date: "2025-09-05",
//           priority: "low",
//         },
//       ]);

//       setAppointments([
//         {
//           id: 1,
//           date: "2025-09-12",
//           time: "09:00",
//           service: "Bảo dưỡng định kỳ",
//           vehicle: "Honda Civic 2020",
//         },
//         {
//           id: 2,
//           date: "2025-09-15",
//           time: "14:30",
//           service: "Sửa chữa động cơ",
//           vehicle: "Toyota Camry 2019",
//         },
//       ]);

//       setQuotations([
//         {
//           id: 1,
//           vehicle: "Honda Civic 2020",
//           issue: "Động cơ kêu lạ",
//           status: "pending",
//           date: "2025-09-10",
//           totalCost: 2000000,
//         },
//         {
//           id: 2,
//           vehicle: "Toyota Camry 2019",
//           issue: "Thay dầu máy",
//           status: "confirmed",
//           date: "2025-09-08",
//           totalCost: 1000000,
//         },
//       ]);
//     } catch (err) {
//       setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
//     }
//   }, []);

//   // ====== DYNAMIC METRICS ======
//   const pendingRequests = repairRequests.filter(
//     (r) => r.status === "pending"
//   ).length;

//   const completedThisMonth = repairRequests.filter((r) => {
//     const requestDate = new Date(r.date);
//     const now = new Date();
//     return (
//       r.status === "completed" &&
//       requestDate.getMonth() === now.getMonth() &&
//       requestDate.getFullYear() === now.getFullYear()
//     );
//   }).length;

//   const upcomingAppointments = appointments.filter(
//     (a) => new Date(a.date) >= new Date()
//   ).length;

//   const pendingQuotations = quotations.filter(
//     (q) => q.status === "pending"
//   ).length;

//   const averageRating = 4.8; // Placeholder

//   if (error) {
//     return <div className="text-red-600 text-center p-6">{error}</div>;
//   }

//   const handleInputChange = (key: string, value: string) => {
//     setFormData(prev => ({ ...prev, [key]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Thêm yêu cầu mới vào danh sách
//     const newRequest: RepairRequest = {
//       id: repairRequests.length + 1,
//       vehicle: formData.vehicle,
//       issue: formData.issue,
//       status: "pending",
//       date: new Date().toISOString().split('T')[0],
//       priority: formData.priority as "high" | "medium" | "low",
//     };
    
//     setRepairRequests([newRequest, ...repairRequests]);
//     setShowForm(false);
//     setFormData({
//       vehicle: "",
//       licensePlate: "",
//       issue: "",
//       priority: "medium",
//     });
//   };

//   return (
//     <div className="space-y-6">
//       {/* ====== WELCOME NOTIFICATION ====== */}
//       <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md shadow-sm">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <Bell className="h-5 w-5 text-green-600" aria-hidden="true" />
//           </div>
//           <div className="ml-3">
//             <p className="text-sm text-green-700">
//               Welcome to GaraPro Auto Repair Management System! We've updated our interface to be more user-friendly.
//               <button className="ml-2 font-medium text-green-700 underline hover:text-green-600">
//                 View Guide
//               </button>
//             </p>
//           </div>
//           <div className="ml-auto pl-3">
//             <div className="-mx-1.5 -my-1.5">
//               <button className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100">
//                 <X className="h-4 w-4" aria-hidden="true" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* ====== HEADER ======
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Hello, John Doe</h1>
//           <p className="text-gray-600 mt-1">Welcome back to GaraPro</p>
//         </div>
//         <Button
//           onClick={() => setShowForm(!showForm)}
//           variant="default"
//           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
//         >
//           {showForm ? (
//             <>
//               <X className="h-4 w-4" />
//               <span>Close Form</span>
//             </>
//           ) : (
//             <>
//               <PlusCircle className="h-4 w-4" />
//               <span>Create New Repair Request</span>
//             </>
//           )}
//         </Button>
//       </div> */}
      
//       {/* ====== QUICK TIPS ====== */}
//       <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
//         <div className="bg-blue-100 p-2 rounded-full mt-1">
//           <CheckCircle className="h-5 w-5 text-blue-600" />
//         </div>
//         <div>
//           <h3 className="font-medium text-blue-800">Helpful Tips</h3>
//           <p className="text-blue-700 text-sm mt-1">You can track your vehicle repair progress in the "Repair Progress" section. Don't forget to schedule regular maintenance to keep your vehicle in optimal condition!</p>
//         </div>
//       </div>

//       {/* ====== GUIDE CAROUSEL ====== */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg overflow-hidden shadow-lg">
//         <div className="p-6 text-white">
//           <h3 className="text-xl font-bold mb-2">User Guide</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-4">
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center text-center">
//               <div className="bg-blue-500 p-3 rounded-full mb-3">
//                 <FileText className="h-6 w-6 text-white" />
//               </div>
//               <h4 className="font-medium mb-1">Create Request</h4>
//               <p className="text-sm text-blue-100">Create new repair requests and track progress from our technical team</p>
//             </div>
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center text-center">
//               <div className="bg-blue-500 p-3 rounded-full mb-3">
//                 <Calendar className="h-6 w-6 text-white" />
//               </div>
//               <h4 className="font-medium mb-1">Schedule Appointment</h4>
//               <p className="text-sm text-blue-100">Book regular maintenance or vehicle inspections at our garage</p>
//             </div>
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center text-center">
//               <div className="bg-blue-500 p-3 rounded-full mb-3">
//                 <MessageSquare className="h-6 w-6 text-white" />
//               </div>
//               <h4 className="font-medium mb-1">Get Notifications</h4>
//               <p className="text-sm text-blue-100">Receive updates about repair progress, quotes, and important information</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ====== REQUEST FORM ====== */}
//       {showForm && (
//         <Card className="mb-6 border-blue-200 shadow-sm">
//           <CardHeader className="bg-blue-50 border-b border-blue-100">
//             <CardTitle className="flex items-center gap-2">
//               <Wrench className="h-5 w-5 text-blue-600" />
//               Create New Repair Request
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="pt-6">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
//                     <Car className="h-4 w-4 text-blue-600" />
//                     Vehicle Information
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.vehicle}
//                     onChange={(e) => handleInputChange("vehicle", e.target.value)}
//                     className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter make, model and year"
//                     required
//                   />
//                 </div>
                
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
//                     <FileText className="h-4 w-4 text-blue-600" />
//                     License Plate
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.licensePlate}
//                     onChange={(e) => handleInputChange("licensePlate", e.target.value)}
//                     className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Example: 30A-12345"
//                     required
//                   />
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
//                   <AlertCircle className="h-4 w-4 text-blue-600" />
//                   Issue Description
//                 </label>
//                 <textarea
//                   value={formData.issue}
//                   onChange={(e) => handleInputChange("issue", e.target.value)}
//                   className="w-full p-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Describe the issue in detail (noise, vibration, warning lights...)"
//                   rows={3}
//                   required
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
//                   <AlertTriangle className="h-4 w-4 text-blue-600" />
//                   Priority Level
//                 </label>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                   <div className="bg-green-50 px-3 py-2 rounded-md border border-green-100 flex items-center">
//                     <input 
//                       type="radio" 
//                       id="low" 
//                       name="priority" 
//                       value="low" 
//                       checked={formData.priority === "low"}
//                       onChange={(e) => handleInputChange("priority", e.target.value)}
//                       className="mr-2"
//                     />
//                     <label htmlFor="low" className="text-sm cursor-pointer">Low - Can wait</label>
//                   </div>
//                   <div className="bg-yellow-50 px-3 py-2 rounded-md border border-yellow-100 flex items-center">
//                     <input 
//                       type="radio" 
//                       id="medium" 
//                       name="priority" 
//                       value="medium" 
//                       checked={formData.priority === "medium"}
//                       onChange={(e) => handleInputChange("priority", e.target.value)}
//                       className="mr-2"
//                     />
//                     <label htmlFor="medium" className="text-sm cursor-pointer">Medium</label>
//                   </div>
//                   <div className="bg-red-50 px-3 py-2 rounded-md border border-red-100 flex items-center">
//                     <input 
//                       type="radio" 
//                       id="high" 
//                       name="priority" 
//                       value="high" 
//                       checked={formData.priority === "high"}
//                       onChange={(e) => handleInputChange("priority", e.target.value)}
//                       className="mr-2"
//                     />
//                     <label htmlFor="high" className="text-sm cursor-pointer">High - Urgent</label>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex justify-end space-x-3 pt-2">
//                 <Button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   variant="outline"
//                   className="flex items-center gap-2 border-gray-300"
//                 >
//                   <X className="h-4 w-4" />
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
//                 >
//                   <CheckCircle className="h-4 w-4" />
//                   Submit Request
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* ====== METRICS CARDS ====== */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
//         <Link href="/customer/repairs/progress" className="block w-full">
//           <Card className="bg-blue-50 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all h-full">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-blue-600 text-sm font-medium">Pending Requests</p>
//                   <p className="text-3xl font-bold text-blue-700 mt-1">{pendingRequests}</p>
//                 </div>
//                 <div className="bg-blue-100 p-3 rounded-full">
//                   <Wrench className="h-6 w-6 text-blue-600" />
//                 </div>
//               </div>
//               <div className="mt-4 pt-3 border-t border-blue-100">
//                 <span className="text-xs text-blue-600 flex items-center">
//                   <ArrowRight className="h-3 w-3 mr-1" /> View Details
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </Link>

//         <Link href="/customer/repairs/history" className="block w-full">
//           <Card className="bg-green-50 border-green-100 hover:border-green-300 hover:shadow-md transition-all h-full">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-green-600 text-sm font-medium">Completed This Month</p>
//                   <p className="text-3xl font-bold text-green-700 mt-1">{completedThisMonth}</p>
//                 </div>
//                 <div className="bg-green-100 p-3 rounded-full">
//                   <CheckCircle className="h-6 w-6 text-green-600" />
//                 </div>
//               </div>
//               <div className="mt-4 pt-3 border-t border-green-100">
//                 <span className="text-xs text-green-600 flex items-center">
//                   <ArrowRight className="h-3 w-3 mr-1" /> View History
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </Link>

//         <Link href="/customer/services/appointments" className="block w-full">
//           <Card className="bg-orange-50 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all h-full">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-orange-600 text-sm font-medium">Upcoming Appointments</p>
//                   <p className="text-3xl font-bold text-orange-700 mt-1">{upcomingAppointments}</p>
//                 </div>
//                 <div className="bg-orange-100 p-3 rounded-full">
//                   <Calendar className="h-6 w-6 text-orange-600" />
//                 </div>
//               </div>
//               <div className="mt-4 pt-3 border-t border-orange-100">
//                 <span className="text-xs text-orange-600 flex items-center">
//                   <ArrowRight className="h-3 w-3 mr-1" /> View Appointments
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </Link>

//         <Link href="/customer/reviews" className="block w-full">
//           <Card className="bg-purple-50 border-purple-100 hover:border-purple-300 hover:shadow-md transition-all h-full">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-purple-600 text-sm font-medium">Average Rating</p>
//                   <p className="text-3xl font-bold text-purple-700 mt-1">{averageRating}</p>
//                 </div>
//                 <div className="bg-purple-100 p-3 rounded-full">
//                   <Star className="h-6 w-6 text-purple-600" />
//                 </div>
//               </div>
//               <div className="mt-4 pt-3 border-t border-purple-100">
//                 <span className="text-xs text-purple-600 flex items-center">
//                   <ArrowRight className="h-3 w-3 mr-1" /> View Reviews
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </Link>

//         <Link href="/customer/notifications" className="block w-full">
//           <Card className="bg-yellow-50 border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all h-full">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-yellow-600 text-sm font-medium">Pending Quotations</p>
//                   <p className="text-3xl font-bold text-yellow-700 mt-1">{pendingQuotations}</p>
//                 </div>
//                 <div className="bg-yellow-100 p-3 rounded-full">
//                   <FileText className="h-6 w-6 text-yellow-600" />
//                 </div>
//               </div>
//               <div className="mt-4 pt-3 border-t border-yellow-100">
//                 <span className="text-xs text-yellow-600 flex items-center">
//                   <ArrowRight className="h-3 w-3 mr-1" /> View Quotations
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </Link>
//       </div>

//       {/* ====== RECENT REQUESTS + UPCOMING APPOINTMENTS ====== */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
//         {/* Recent Requests */}
//         <Card className="border-blue-100 hover:border-blue-200 transition-all">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center gap-2">
//               <Wrench className="h-5 w-5 text-blue-600" />
//               Recent Requests
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {repairRequests.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
//                 <Wrench className="h-10 w-10 text-gray-300 mb-2" />
//                 <p className="text-gray-500">No requests found.</p>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="mt-3 text-blue-600 border-blue-200 hover:bg-blue-50"
//                   onClick={() => setShowForm(true)}
//                 >
//                   <PlusCircle className="h-4 w-4 mr-1" />
//                   Create New Request
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {repairRequests.slice(0, 3).map((request) => (
//                   <Link
//                     href={`/customer/repairs/progress?requestId=${request.id}`}
//                     key={request.id}
//                     className="block"
//                   >
//                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition border border-gray-100 hover:border-blue-200">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-blue-50 p-2 rounded-full">
//                           <Car className="h-4 w-4 text-blue-600" />
//                         </div>
//                         <div>
//                           <p className="font-medium">{request.vehicle}</p>
//                           <p className="text-sm text-gray-500">{request.issue}</p>
//                         </div>
//                       </div>
//                       <Badge
//                         variant={request.status === "completed" ? "success" : 
//                                request.status === "in-progress" ? "default" : "outline"}
//                         className={request.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-200" : 
//                                  request.status === "in-progress" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : 
//                                  "bg-gray-100 text-gray-800 hover:bg-gray-200"}
//                       >
//                         {request.status === "completed"
//                           ? "Completed"
//                           : request.status === "in-progress"
//                           ? "In Progress"
//                           : "Pending"}
//                       </Badge>
//                     </div>
//                   </Link>
//                 ))}
//                 <div className="flex justify-end mt-2">
//                   <Button variant="link" asChild className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
//                     <Link href="/customer/repairs">
//                       View All <ArrowRight className="h-4 w-4" />
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Upcoming Appointments */}
//         <Card className="border-orange-100 hover:border-orange-200 transition-all">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center gap-2">
//               <Calendar className="h-5 w-5 text-orange-600" />
//               Upcoming Appointments
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {appointments.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
//                 <Calendar className="h-10 w-10 text-gray-300 mb-2" />
//                 <p className="text-gray-500">Không có lịch hẹn nào.</p>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="mt-3 text-orange-600 border-orange-200 hover:bg-orange-50"
//                   asChild
//                 >
//                   <Link href="/customer/services/appointments/create">
//                     <PlusCircle className="h-4 w-4 mr-1" />
//                     Schedule New Appointment
//                   </Link>
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {appointments.map((appointment) => (
//                   <Link
//                     href={`/customer/services/appointments?appointmentId=${appointment.id}`}
//                     key={appointment.id}
//                     className="block"
//                   >
//                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition border border-gray-100 hover:border-orange-200">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-orange-50 p-2 rounded-full">
//                           <Calendar className="h-4 w-4 text-orange-600" />
//                         </div>
//                         <div>
//                           <p className="font-medium">{appointment.service}</p>
//                           <p className="text-sm text-gray-500">
//                             {appointment.date} - {appointment.time}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
//                           Upcoming
//                         </Badge>
//                         <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:bg-orange-100 hover:text-orange-700">
//                           <ChevronRight className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </Link>
//                 ))}
//                 <div className="flex justify-end mt-2">
//                   <Button variant="link" asChild className="flex items-center gap-1 text-orange-600 hover:text-orange-800">
//                     <Link href="/customer/services/appointments">
//                       View All <ArrowRight className="h-4 w-4" />
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//         <Footer/>
//       </div>
//     </div>
//   );
// }
