"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import dynamic from "next/dynamic";

// import react-slick with dynamic (fix SSR issues in Next.js)
const Slider = dynamic(() => import("react-slick"), { ssr: false });

// slick-carousel css
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    profession: "Car Owner",
    image: "/images/testimonial-1.jpg",
    text: "Garage Pro is amazing! They quickly diagnosed and fixed my car problem. Highly recommended.",
  },
  {
    id: 2,
    name: "Sarah Smith",
    profession: "Businesswoman",
    image: "/images/carousel-2.png",
    text: "Professional service with friendly staff. I always bring my car here for regular maintenance.",
  },
  {
    id: 3,
    name: "Michael Johnson",
    profession: "Taxi Driver",
    image: "/images/carousel-1.png",
    text: "Affordable prices and great service quality. My car feels brand new after the repair!",
  },
  {
    id: 4,
    name: "Emily Davis",
    profession: "Teacher",
    image: "/images/testimonial-4.jpg",
    text: "The best garage in town! They explained everything clearly and finished the job on time.",
  },
];

export default function TestimonialCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 800,
    autoplaySpeed: 4000,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768, // mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          What Our Clients Say
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Real stories from satisfied customers
        </p>
      </div>

      <div className="container mx-auto px-6">
        <Slider {...settings}>
          {testimonials.map((t) => (
            <div key={t.id} className="px-4">
              <div className="bg-white relative rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 text-center">
                {/* quote icon */}
                <Quote className="w-8 h-8 text-primary absolute top-4 left-4 opacity-20" />

                {/* avatar */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full p-[3px] bg-gradient-to-tr from-primary to-pink-500">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-full h-full border-2 border-white"
                  />
                </div>

                {/* text */}
                <p className="italic text-gray-600 text-sm leading-relaxed mb-4">
                  “{t.text}”
                </p>

                {/* name + profession */}
                <h5 className="font-semibold text-gray-800">{t.name}</h5>
                <p className="text-xs text-gray-500">{t.profession}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
