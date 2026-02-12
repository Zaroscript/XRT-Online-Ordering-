import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { Testimonials_bg, Testimonials_content } from "./../../config/constants";
import ViewTestimonials from "./ViewTestimonials";
import { useTestimonialsQuery } from "@/api";

export default function Testimonials() {
  const { testimonials: serverData, isLoading, isError } = useTestimonialsQuery();

  // Use server data if available, otherwise fall back to hardcoded constants
  const testimonials =
    !isLoading && !isError && serverData.length > 0
      ? serverData
      : isLoading
        ? [] // Show skeleton while loading
        : Testimonials_content; // Fallback to constants on error or empty

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="relative w-full h-[500px] bg-cover bg-center py-[80px] flex justify-center items-center"
        style={{ backgroundImage: `url(${Testimonials_bg.src})` }}
      >
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-white/20" />
          <div className="w-[400px] h-5 rounded bg-white/20" />
          <div className="w-[300px] h-5 rounded bg-white/15" />
          <div className="w-[80px] h-[80px] rounded-full bg-white/20 mt-2" />
          <div className="w-[150px] h-4 rounded bg-white/20" />
          <div className="w-[100px] h-3 rounded bg-white/15" />
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <div
      className="relative w-full h-[500px] bg-cover bg-center py-[80px]  flex justify-center"
      style={{ backgroundImage: `url(${Testimonials_bg.src})` }}
    >
      <button
        className="
    custom-prev
    absolute left-6 top-1/2 -translate-y-1/2 z-30
    w-12 h-12
    flex items-center justify-center
    rounded-md
    border-[1.5px] border-black/20
    bg-white/10
    text-black text-xl
    shadow-sm
    hover:bg-white/30
    transition-all duration-150
    focus:outline-none 
    select-none
  "
        aria-label="Previous"
      >
        ❮
      </button>

      <button
        className="
    custom-next
    absolute right-6 top-1/2 -translate-y-1/2 z-30
    w-12 h-12
    flex items-center justify-center
    rounded-md
    border-[1.5px] border-black/20
    bg-white/10
    text-black text-xl
    shadow-sm
    hover:bg-white/30
    transition-all duration-150
    focus:outline-none
    select-none
  "
        aria-label="Next"
      >
        ❯
      </button>

      <div className="w-full max-w-[900px]">
        <Swiper
          modules={[Autoplay, Navigation]}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
        >
          {testimonials.map((item, idx) => (
            <SwiperSlide key={item.id || idx} className="flex items-center justify-center">
              <ViewTestimonials item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
