import { Quote } from 'lucide-react'
import React from 'react'

export default function ViewTestimonials({ item }) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <Quote className="w-10 h-10 text-[#5C9963] mb-4" />
      <p className="text-[22px] text-gray-700 italic mb-4 w-[500px]">
        {item.feedback}
      </p>
      <img
        src={item.image}
        alt=""
        className="w-[80px] h-[80px] rounded-full mb-5"
      />


      <h3 className="text-[20px] font-[700]">{item.name}</h3>
      <span className="text-gray-500">{item.Role}</span>
    </div>
  );
}

