import React from "react";

export default function ContactForm() {
  return (
    
      <div className="max-w-5xl mx-auto px-6 mt-[-300px] relative z-30 py-20">
        <div className="bg-white rounded-2xl shadow-sm p-16">
          <h2 className="text-4xl font-bold text-center text-[#2F3E30] mb-4">
            Contact us
          </h2>

          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-16">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
            quaerat unde quam dolor culpa veritatis inventore.
          </p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-8">
              <input
                type="text"
                placeholder="Name *"
                className="w-full px-8 py-5 border border-gray-300 rounded-[12px] focus:border-green-600 outline-none"
              />

              <input
                type="email"
                placeholder="Email address *"
                className="w-full px-8 py-5 border border-gray-300 rounded-[12px] focus:border-green-600 outline-none"
              />

              <input
                type="tel"
                placeholder="Your mobile *"
                className="w-full px-8 py-5 border border-gray-300 rounded-[12px] focus:border-green-600 outline-none"
              />
            </div>

            <textarea
              placeholder="Message"
              rows="9"
              className="w-full px-8 py-5 border border-gray-300 rounded-[12px] resize-none focus:border-green-600 outline-none"
            ></textarea>

            
            <div className="md:col-span-2 flex items-start gap-3 mt-4 relative">
              <input type="checkbox" className="mt-1 accent-green-700" />
              <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                I accept the terms & conditions and I understand that my data
                will be hold securely in accordance with the{" "}
                <span className="font-semibold text-gray-700 cursor-pointer">
                  privacy policy
                </span>
                .
              </p>
              <div className="md:col-span-2 flex justify-end">
                <button className="px-20 py-5 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition absolute right-0">
                  SUBMIT
                </button>
              </div>
            </div>

            
          </form>
        </div>
      </div>
  );
}
