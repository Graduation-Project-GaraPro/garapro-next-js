import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link"; // Thêm import Link
import { 
  ArrowRight, 
  Wrench, 
  Shield, 
  Users, 
  CheckCircle,
  Download,
  BarChart,
  Calendar,
  MessageSquare,
  CreditCard,
  Menu
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
              <Image 
                src="/logo.png"
                alt="GaragePro Logo"
                width={60}
                height={60}
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-900">GaragePro</span>
            <Badge variant="outline" className="hidden sm:inline-flex ml-2 bg-blue-50 text-blue-700 border-blue-200">
              DCGMS
            </Badge>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">How It Works</a>
            <a href="#benefits" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Benefits</a>
            <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            {/* Sử dụng Link cho nút Login/Register */}
            <Link href="/login" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm px-3 md:px-4">
                <span className="hidden sm:inline">Login / Register</span>
                <span className="sm:hidden">Login</span>
                <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 lg:pt-20 pb-8 md:pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <Badge className="mb-3 md:mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs md:text-sm">
              Digital Car Garage Management System
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900 mb-3 md:mb-4">
              Optimize Your <span className="text-blue-600">Auto Repair</span> Workflow
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
              GaragePro is a modern car garage management system designed to replace manual and fragmented processes in vehicle reception, repair, maintenance, and delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
                <span className="text-sm md:text-base">Download Android App</span>
              </Button>
              {/* Sử dụng Link cho nút Get Started */}
              <Link href="/login" passHref>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <span className="text-sm md:text-base">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-6 md:mt-8 flex items-center gap-3 md:gap-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">200+ garages trust us</p>
                <p className="text-xs md:text-sm text-gray-500">40% increase in efficiency</p>
              </div>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl md:rounded-2xl p-2 shadow-xl">
              <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">GaragePro Dashboard</h3>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-red-400"></div>
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="space-y-2 md:space-y-4">
                  {['Vehicle Check-in', 'Assign Technician', 'Track Progress', 'Payment'].map((item, idx) => (
                    <div key={idx} className="flex items-center p-2 md:p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition">
                      <div className="h-6 w-6 md:h-8 md:w-8 rounded-md bg-blue-100 flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                        {idx === 0 && <Wrench className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />}
                        {idx === 1 && <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />}
                        {idx === 2 && <BarChart className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />}
                        {idx === 3 && <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />}
                      </div>
                      <span className="font-medium text-xs md:text-sm flex-1">{item}</span>
                      <div className="ml-auto">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs md:text-sm font-medium">In Repair</p>
                      <p className="text-xl md:text-2xl font-bold">12</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium">Completed Today</p>
                      <p className="text-xl md:text-2xl font-bold">8</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-8 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Key Features of GaragePro
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              System helps technicians, garage managers and customers interact efficiently, transparently and accurately
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Calendar, title: "Online Appointment", desc: "Customers easily book repair appointments via mobile app" },
              { icon: Users, title: "Assign Technicians", desc: "Automatically assign work to suitable technicians based on expertise" },
              { icon: BarChart, title: "Track Progress", desc: "Customers track repair progress directly from their phone" },
              { icon: MessageSquare, title: "Multi-way Interaction", desc: "Direct messaging between customers, technicians and garage managers" },
              { icon: Shield, title: "Emergency Support", desc: "Support customers in emergency situations through mobile app" },
              { icon: CreditCard, title: "Electronic Payment", desc: "Process payments quickly with multiple payment methods" }
            ].map((feature, idx) => (
              <Card key={idx} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition">
                <CardContent className="p-4 md:p-6">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3 md:mb-4">
                    <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-4 md:px-6 py-8 md:py-16 lg:py-20">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            How Does GaragePro Work?
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Optimize the entire garage process - from appointment to payment
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { step: "01", title: "Book Appointment", desc: "Customer books via app or website" },
            { step: "02", title: "Check-in Vehicle", desc: "Garage manager receives and assesses vehicle condition" },
            { step: "03", title: "Assign & Repair", desc: "System assigns technician and tracks progress" },
            { step: "04", title: "Deliver & Pay", desc: "Notify customer and process electronic payment" }
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <div className="text-center">
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-600 text-white text-xl md:text-2xl font-bold flex items-center justify-center mx-auto mb-3 md:mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{step.desc}</p>
              </div>
              {idx < 3 && (
                <div className="hidden lg:block absolute top-7 md:top-8 left-3/4 w-full h-0.5 bg-blue-200"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-gradient-to-r from-blue-50 to-gray-100 py-8 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Benefits of Using GaragePro
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Help garages reduce errors, increase productivity and optimize customer experience
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">60% Fewer Errors</h3>
              <p className="text-sm md:text-base text-gray-600 px-4">Process automation helps minimize errors in management and repairs</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <BarChart className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">40% Higher Productivity</h3>
              <p className="text-sm md:text-base text-gray-600 px-4">Optimized assignment and work management increases work productivity</p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Customer Satisfaction</h3>
              <p className="text-sm md:text-base text-gray-600 px-4">Transparent information and better interaction increases customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-16 lg:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-4">
            Ready to Digitize Your Garage?
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Download GaragePro app today to manage your garage more efficiently
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
              <span className="text-sm md:text-base">Download Android</span>
            </Button>
            {/* Thêm Link cho nút Contact Sales nếu cần */}
            <Link href="/login" passHref>
              <Button size="lg" variant="outline" className="text-black border-white hover:bg-white/10 w-full sm:w-auto">
                <span className="text-sm md:text-base">Get Started Now</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 md:mt-6 text-xs md:text-sm text-blue-200">
            Available on all Android devices. iOS coming soon.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Image 
                  src="/logo.png"
                  alt="GaragePro Logo"
                  width={50}
                  height={50}
                  className="h-full w-auto object-contain"
                />
                <span className="text-lg md:text-xl font-bold text-gray-900">GaragePro</span>
              </div>
              <p className="text-sm md:text-base text-gray-600">
                Modern digital car garage management system, helping to optimize the entire vehicle repair and maintenance process.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Product</h4>
              <ul className="space-y-1.5 md:space-y-2">
                <li><a href="#features" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">Features</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">Pricing</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">Download App</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Company</h4>
              <ul className="space-y-1.5 md:space-y-2">
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">About Us</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">Blog</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">Careers</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-600 hover:text-blue-600 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Contact</h4>
              <ul className="space-y-1.5 md:space-y-2">
                <li className="text-sm md:text-base text-gray-600">Email: support@garagepro.com</li>
                <li className="text-sm md:text-base text-gray-600">Phone: (024) 1234 5678</li>
                <li className="text-sm md:text-base text-gray-600">Address: GaragePro Building, DaNang</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-600">
            <p className="text-xs md:text-sm">
              &copy; {new Date().getFullYear()} GaragePro - Digital Car Garage Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}