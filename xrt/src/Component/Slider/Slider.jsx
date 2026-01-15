import React from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { images_slider } from "../../config/constants";
import Content from './Photo_Content';

export default function Sliderfun() {
  const sliderHeight = 650;

  return (
    <div className="relative">

      <button
        className="
          custom-prev
          absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-12 h-12
          backdrop-blur-md bg-white/10
          text-white text-3xl
          flex items-center justify-center
          rounded-full
          shadow-lg
          hover:bg-white/20
          transition-all
        "
      >
        ❮
      </button>

      
      <button
        className="
          custom-next
          absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-12 h-12
          backdrop-blur-md bg-white/10
          text-white text-3xl
          flex items-center justify-center
          rounded-full
          shadow-lg
          hover:bg-white/20
          transition-all
        "
      >
        ❯
      </button>

      <Swiper
        slidesPerView={1}
        loop={true}
        modules={[Autoplay, Navigation]}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        style={{ height: `${sliderHeight}px` }}
      >
        {images_slider.map((current, id) => (
          <SwiperSlide key={id} className="h-full">
            <Content
              src={current.src}
              title={current.title}
              description={current.description}
              offer={current.offer}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
