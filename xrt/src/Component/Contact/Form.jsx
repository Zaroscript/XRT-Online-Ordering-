import React from "react";
import { Link } from "react-router-dom";

export default function ContactForm() {
  return (
    
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-0 xl:mt-[-300px] relative z-30 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-12 lg:p-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-4">
            Contact us
          </h2>

          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-10 lg:mb-16">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita
            quaerat unde quam dolor culpa veritatis inventore.
          </p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-6 md:space-y-8">
              <input
                type="text"
                placeholder="Name *"
                className="w-full px-8 py-5 border border-gray-300 rounded-[12px] focus:border-primary outline-none"
              />

              <input
                type="email"
                placeholder="Email address *"
                className="w-full px-8 py-5 border border-gray-300 rounded-[12px] focus:border-primary outline-none"
              />

              <input
                type="tel"
                placeholder="Your mobile *"
                className="w-full px-8 py-5 border border-gray-300 rounded-[12px] focus:border-primary outline-none"
              />
            </div>

            <textarea
              placeholder="Message"
              rows="6"
              className="w-full px-8 py-5 border border-gray-300 rounded-[12px] resize-none focus:border-primary outline-none"
            ></textarea>

            
            <div className="md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1.5 accent-primary h-4 w-4" />
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                  I accept the{" "}
                  <Link
                    to="/terms-and-conditions"
                    className="font-semibold text-gray-700 underline underline-offset-2"
                  >
                    terms & conditions
                  </Link>{" "}
                  and I understand that my data will be hold securely in
                  accordance with the{" "}
                  <span className="font-semibold text-gray-700 cursor-pointer">
                    privacy policy
                  </span>
                  .
                </p>
              </div>
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                <button className="w-full md:w-auto px-16 md:px-20 py-5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition shadow-sm">
                  SUBMIT
                </button>
              </div>
            </div>

            
          </form>
        </div>
      </div>
  );
}
