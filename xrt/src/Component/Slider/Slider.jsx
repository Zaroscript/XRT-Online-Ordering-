import React from "react";
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
      const isVideo = slide.bgType === "video";
      
      const getMediaUrl = (media) => {
        if (!media) return "";
        if (typeof media === "string") return media;
        // Handle cases where it might be an array or an object
        const target = Array.isArray(media) ? media[0] : media;
        return (
          target?.original ??
          target?.thumbnail ??
          target?.url ??
          target?.path ??
          ""
        );
      };

      const rawSrc = getMediaUrl(slide.bgImage);
      const rawVideoSrc = isVideo ? getMediaUrl(slide.bgVideo) : null;

      return {
        key: `hero-${index}-${slide.title || "slider"}-${index}`,
        src: resolveImageUrl(rawSrc),
        videoSrc: rawVideoSrc ? resolveImageUrl(rawVideoSrc) : null,
        title: slide.subtitle || "",
        description: slide.title || "",
        subtitleTwo: slide.subtitleTwo || "",
        offer: slide.offer || "",
        btnText: slide.btnText || "Order Now",
        btnLink: slide.btnLink || "",
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

  const current = slides[0];

  return (
    <div className="relative w-full">
      <Content
        src={current.src}
        videoSrc={current.videoSrc}
        title={current.title}
        description={current.description}
        subtitleTwo={current.subtitleTwo}
        offer={current.offer}
        btnText={current.btnText}
        btnLink={current.btnLink}
      />
    </div>
  );
}
