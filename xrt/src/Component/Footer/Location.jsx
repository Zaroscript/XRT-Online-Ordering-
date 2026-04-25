import React from "react";
import { Phone } from "lucide-react";
import { useSiteSettingsQuery } from "../../api";
import { formatPhone } from "../../utils/phoneUtils";

export default function Location() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;

  return (
    <>
      <li className="flex justify-center md:justify-start items-start gap-3 text-[#E1E1E1] text-[15px]">
        <div className="mt-1">
          <i className="fa-solid fa-location-dot text-[18px]" style={{ color: 'var(--color-primary)' }}></i>
        </div>
        <div className="leading-relaxed">
          {contactDetails?.formattedAddress || 
            (contactDetails?.address ? `${contactDetails.address.street || ''}, ${contactDetails.address.city || ''}` : '') ||
            ""}
        </div>
      </li>
      <li className="flex justify-center md:justify-start items-center gap-3">
        <div className="">
          <i className="fa-regular fa-envelope text-[18px]" style={{ color: 'var(--color-primary)' }}></i>
        </div>
        <a 
          href={`mailto:${contactDetails?.emailAddress}`}
          className="text-[#E1E1E1] text-[15px] transition-colors duration-200"
          onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
          onMouseLeave={(e) => e.target.style.color = ''}
        >
          {contactDetails?.emailAddress}
        </a>
      </li>
      <li className="flex justify-center md:justify-start items-center gap-3">
        <div className="">
          <Phone strokeWidth={3} size={18} style={{ color: 'var(--color-primary)' }} />
        </div>
        <a 
          href={`tel:${contactDetails?.contact}`}
          className="text-[#E1E1E1] text-[15px] transition-colors duration-200"
          onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
          onMouseLeave={(e) => e.target.style.color = ''}
        >
          {formatPhone(contactDetails?.contact)}
        </a>
      </li>
      {/* Operating Hours */}
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
          <li className="flex mt-6 flex-col items-center md:items-start gap-2">
             <span className="font-bold text-[18px] uppercase tracking-wider block" style={{ color: 'var(--color-primary)' }}>Opening Hours</span>
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
