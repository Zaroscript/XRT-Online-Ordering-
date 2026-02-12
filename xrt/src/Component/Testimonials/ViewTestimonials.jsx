import { Quote, UserCircle } from "lucide-react";
import React from "react";

export default function ViewTestimonials({ item }) {
  // Normalise field: server sends `role`, legacy constants use `Role`
  const role = item.role || item.Role;

  return (
    <div className="flex flex-col items-center text-center px-4">
      <Quote className="w-10 h-10 text-[#5C9963] mb-4" />
      <p className="text-[22px] text-gray-700 italic mb-4 w-[500px]">
        {item.feedback}
      </p>

      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-[80px] h-[80px] rounded-full mb-5 object-cover"
        />
      ) : (
        <div className="w-[80px] h-[80px] rounded-full mb-5 bg-gray-200 flex items-center justify-center">
          <UserCircle className="w-12 h-12 text-gray-400" />
        </div>
      )}

      <h3 className="text-[20px] font-[700]">{item.name}</h3>
      {role && <span className="text-gray-500">{role}</span>}
    </div>
  );
}
