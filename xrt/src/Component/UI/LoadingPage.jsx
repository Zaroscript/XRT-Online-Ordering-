import React from "react";
import { UtensilsCrossed } from "lucide-react";
import { COLORS } from "@/config/colors";

export default function LoadingPage() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(160deg, #f8faf8 0%, ${COLORS.white} 40%, #e8f5ea 100%)`,
        "--primary": COLORS.primary,
        "--text-primary": COLORS.textPrimary,
      }}
      aria-live="polite"
      aria-label="Loading"
    >
      {/* Soft decorative circles */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-[0.08]"
        style={{ background: COLORS.primary }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-[0.06]"
        style={{ background: COLORS.primary }}
      />

      <div className="relative flex flex-col items-center gap-8">
        <div
          className="flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`,
            boxShadow: `0 10px 40px -8px ${COLORS.primary}40`,
          }}
          role="img"
          aria-hidden="true"
        >
          <UtensilsCrossed className="w-10 h-10 text-white" strokeWidth={1.8} />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: COLORS.textPrimary }}
          >
            Preparing your menu
          </h1>
          <p className="text-sm text-gray-500 max-w-[200px]">
            Getting everything ready for you...
          </p>
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center justify-center gap-1.5" role="status" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                background: COLORS.primary,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
