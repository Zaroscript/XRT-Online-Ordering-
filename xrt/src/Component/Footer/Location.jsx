import React from "react";
import { Phone } from "lucide-react";
import { useSiteSettingsQuery } from "../../api";
import { formatPhone } from "../../utils/phoneUtils";

export default function Location() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;

  return (
    <>
      <li className="text-[#E1E1E1] mt-3 text-[17px] text-center md:text-left">
        {[
          contactDetails?.location?.street_address,
          contactDetails?.location?.city,
          contactDetails?.location?.state,
        ]
          .filter(Boolean)
          .join(", ") + (contactDetails?.location?.zip ? ` ${contactDetails.location.zip}` : "")}
      </li>
      <li className="flex mt-4 justify-center md:justify-start items-center">
        <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
          <i className="fa-regular fa-envelope text-primary"></i>
        </div>
        <a 
          href={`mailto:${contactDetails?.emailAddress}`}
          className="mt-2 text-[#E1E1E1] text-[17px] hover:text-primary transition-colors"
        >
          {contactDetails?.emailAddress}
        </a>
      </li>
      <li className="flex mt-4 justify-center md:justify-start items-center">
        <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
          <Phone strokeWidth={3} className="text-primary" size={18} />
        </div>
        <a 
          href={`tel:${contactDetails?.contact}`}
          className="mt-2 text-[#E1E1E1] text-[17px] hover:text-primary transition-colors"
        >
          {formatPhone(contactDetails?.contact)}
        </a>
      </li>
      {/* Operating Hours */}
      {/* Operating Hours List */}
      {/* Operating Hours - Current Day Only */}
      {(() => {
        if (!settings?.operating_hours?.schedule) return null;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = days[new Date().getDay()];
        const todaySlot = settings.operating_hours.schedule.find(s => s.day === currentDayName);

        if (!todaySlot) return null;

        const to12Hour = (timeStr) => {
          if (!timeStr) return '';
          const [hour, minute] = timeStr.split(':');
          const h = parseInt(hour, 10);
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 || 12;
          return `${h12}:${minute} ${ampm}`;
        };

        return (
          <li className="flex mt-4 flex-col items-center md:items-start">
             <h4 className="text-[#FFA900] font-bold text-[17px] mb-2">OPENING HOURS</h4>
             <div className="text-[#E1E1E1] text-[15px]">
               {todaySlot.is_closed ? (
                 <span>{todaySlot.day}: Closed</span>
               ) : (
                 <span>{todaySlot.day}: {to12Hour(todaySlot.open_time)} - {to12Hour(todaySlot.close_time)}</span>
               )}
             </div>
          </li>
        );
      })()}
    </>
  );
}
