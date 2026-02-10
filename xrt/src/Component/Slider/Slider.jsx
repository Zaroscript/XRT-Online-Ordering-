import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useSiteSettingsQuery } from "@/api";
import { API_BASE_URL } from "@/config/api";
import Content from "./Photo_Content";

/** Resolve image URL: use as-is if absolute, else prepend API base for relative paths */
function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = API_BASE_URL.replace(/\/api\/v\d+$/, ""); // server origin
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

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
        className="w-full bg-gray-100 animate-pulse"
        style={{ height: 650 }}
        aria-hidden
      />
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
