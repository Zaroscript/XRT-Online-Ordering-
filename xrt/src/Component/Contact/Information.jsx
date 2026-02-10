import { Mail, MapPinned, PhoneCall } from "lucide-react";
import React from "react";
import { useSiteSettingsQuery } from "../../api";

export default function Information() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  const schedule = settings?.operating_hours?.schedule;

  return (
    <>
      <div className="text-center flex flex-col items-center justify-center py-8">
        <h3 className="text-[30px] font-bold text-[#2F3E30]">
          Keep in touch with us
        </h3>
        <p className="w-[700px] text-[#656766]">
          {settings?.siteSubtitle || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita quaerat unde quam dolor culpa veritatis inventore, aut commodi eum veniam vel'}
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
            {[
              contactDetails?.location?.street_address,
              contactDetails?.location?.city,
              contactDetails?.location?.state
            ].filter(Boolean).join(", ")}
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
            Mobile : <span className="font-bold">{contactDetails?.contact}</span>
            <br />
            {/* Hotline can be added if available in settings, otherwise hidden or using a second contact */}
             
            <br />
            E-mail : <a href={`mailto:${contactDetails?.emailAddress}`} className="font-[500] text-[#528959]">{contactDetails?.emailAddress}</a>
          </p>
        </div>

        <div className="relative">
          <Mail
            strokeWidth={0.5}
            size={50}
            className="absolute left-[-60px] text-[#5D9063]"
          />
          <h3 className="font-bold text-[#2F3E30] text-[20px]">Hour of operation</h3>
          <div className="text-[#656766] w-[250px] py-2">
            {schedule?.map((item, index) => (
                !item.is_closed && (
                    <div key={index} className="mb-1">
                        <span className="font-semibold">{item.day}:</span> {item.open_time} - {item.close_time}
                    </div>
                )
            ))}
            {(!schedule || schedule.every(s => s.is_closed)) && <p>Closed</p>}
          </div>
        </div>
      </div>
    </>
  );
}
