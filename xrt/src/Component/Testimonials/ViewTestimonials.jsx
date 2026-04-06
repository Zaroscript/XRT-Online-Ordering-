import { Quote, UserCircle } from "lucide-react";
import React from "react";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

export default function ViewTestimonials({ item, className = "" }) {
  const role = item.role || item.Role;
  const imageSrc = resolveImageUrl(typeof item.image === "string" ? item.image : item.image?.original || item.image?.thumbnail || "");

  return (
    <div className={`flex flex-col items-center text-center px-4 ${className}`}>
      <Quote className="w-10 h-10 text-primary mb-4" />
      <p className="text-lg md:text-[22px] text-gray-700 italic mb-4 w-full max-w-[500px] leading-relaxed">
        {item.feedback}
      </p>

      {imageSrc ? (
        <img
          src={imageSrc}
          alt={item.name}
          className="w-20 h-20 rounded-full mb-5 object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-full mb-5 bg-gray-200 flex items-center justify-center shrink-0">
          <UserCircle className="w-12 h-12 text-gray-400" />
        </div>
      )}

      <h3 className="text-base md:text-[20px] font-bold">{item.name}</h3>
      {role && <span className="text-gray-500 font-medium">{role}</span>}
    </div>
  );
}
