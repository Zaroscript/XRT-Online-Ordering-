import React from "react";
import { COLORS } from "../../config/colors";

export default function ViewMenuList({ item, active, setActive}) {
  return (
    <button
      onClick={() => setActive(item)}
      style={{ '--primary': COLORS.primary }}
      className={`px-5 py-1.5 cursor-pointer rounded-full text-sm font-medium transition-all
        ${
          active === item
            ? "bg-[var(--primary)] text-white"
            : "bg-[#F5F5F5] text-[var(--primary)]"
        }
      `}
    >
      {item}
    </button>
  );
}
