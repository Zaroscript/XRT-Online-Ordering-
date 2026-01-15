import { Mail, MapPinned, PhoneCall } from "lucide-react";
import React from "react";
import { CONTACT_INFO } from "../../config/constants";


export default function Information() {
  return (
    <>
      <div className="text-center flex flex-col items-center justify-center py-8">
        <h3 className="text-[30px] font-bold text-[#2F3E30]">
          Keep in touch with us
        </h3>
        <p className="w-[700px] text-[#656766]">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita
          quaerat unde quam dolor culpa veritatis inventore, aut commodi eum
          veniam vel
        </p>
      </div>
      <div className="grid grid-cols-3 gap-x-[200px] px-[200px] py-[50px]">
        <div className="relative">
          <MapPinned
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Address</h3>
          <p className="text-[#656766] w-[250px] py-2">
            {CONTACT_INFO.address}
          </p>
        </div>

        <div className="relative">
          <PhoneCall
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Contact</h3>
          <p className="text-[#656766] w-[250px] py-2">
            Mobile : <span className="font-bold">{CONTACT_INFO.phone}</span>
            <br />
            Hotline : <span className="font-bold">
              {CONTACT_INFO.hotline}
            </span>{" "}
            <br />
            E-mail : <a href={`mailto:${CONTACT_INFO.email}`} className="font-[500] text-[#528959]">{CONTACT_INFO.email}</a>
          </p>
        </div>

        <div className="relative">
          <Mail
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Hour of operation</h3>
          <p className="text-[#656766] w-[250px] py-2">
            {CONTACT_INFO.working_time[0]}<br />
            {CONTACT_INFO.working_time[1]}
          </p>
        </div>
      </div>
    </>
  );
}
