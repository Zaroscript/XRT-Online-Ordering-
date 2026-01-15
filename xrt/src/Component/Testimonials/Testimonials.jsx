import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";


import {
  Testimonials_bg,
  Testimonials_content,
} from "./../../config/constants";
import ViewTestimonials from "./ViewTestimonials";

export default function Testimonials() {
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
          {Testimonials_content.map((item, idx) => (
            <SwiperSlide key={idx} className="flex items-center justify-center">
              <ViewTestimonials item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
