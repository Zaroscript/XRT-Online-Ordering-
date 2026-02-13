import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useSiteSettingsQuery } from "@/api";
import { resolveImageUrl } from "@/utils/resolveImageUrl";
import Content from "./Photo_Content";

export default function Sliderfun() {
  const sliderHeight = 650;
  const { heroSlides, isLoading } = useSiteSettingsQuery();

  // Only show slides added from the dashboard (no fallback to local data)
  const slides = React.useMemo(() => {
    if (!heroSlides?.length) return [];
    return heroSlides.map((slide, index) => {
      const rawSrc =
        typeof slide.bgImage === "string"
          ? slide.bgImage
          : slide.bgImage?.original ?? slide.bgImage?.thumbnail ?? "";
      return {
        key: `hero-${index}-${slide.title ?? ""}-${index}`,
        src: resolveImageUrl(rawSrc),
        title: slide.subtitle ?? "",
        description: slide.title ?? "",
        subtitleTwo: slide.subtitleTwo ?? "",
        offer: slide.offer ?? "",
        btnText: slide.btnText ?? "Order Now",
        btnLink: slide.btnLink ?? "",
      };
    });
  }, [heroSlides]);

  if (isLoading) {
    return (
      <div
        className="w-full bg-gray-100 animate-pulse flex items-center justify-center"
        style={{ height: 650 }}
        aria-hidden
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200/80 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded-full mt-2" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

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
        type="button"
        aria-label="Previous slide"
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
        type="button"
        aria-label="Next slide"
      >
        ❯
      </button>

      <Swiper
        slidesPerView={1}
        loop={slides.length > 1}
        modules={[Autoplay, Navigation]}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        style={{ height: `${sliderHeight}px` }}
      >
        {slides.map((current) => (
          <SwiperSlide key={current.key} className="h-full">
            <Content
              src={current.src}
              title={current.title}
              description={current.description}
              subtitleTwo={current.subtitleTwo}
              offer={current.offer}
              btnText={current.btnText}
              btnLink={current.btnLink}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
