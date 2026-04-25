import { Mail, MapPinned, Clock } from "lucide-react";
import React from "react";
import { useSiteSettingsQuery } from "../../api";
import { useStoreStatus, to12Hour } from "../../hooks/useStoreStatus";
import SocialLinks from "../Footer/SocialLinks";
import { formatPhone as formatPhoneNumber } from "../../utils/phoneUtils";

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const safeFormatPhone = (value) => {
  if (typeof formatPhoneNumber === "function") {
    return formatPhoneNumber(value);
  }
  return value ? String(value) : "";
};

export default function Information() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  const { todaySlot, schedule } = useStoreStatus();

  // Sort schedule by week order
  const sortedSchedule = schedule.length
    ? [...schedule].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    : [];

  const address = contactDetails?.location?.formattedAddress || 
    contactDetails?.formattedAddress || 
    (contactDetails?.address ? `${contactDetails.address.street || ''}, ${contactDetails.address.city || ''}` : '') ||
    [
      contactDetails?.location?.street_address,
      contactDetails?.location?.city,
      contactDetails?.location?.state
    ].filter(Boolean).join(", ") + (contactDetails?.location?.zip ? ` ${contactDetails.location.zip}` : "");

  return (
    <>
      <div className="text-center flex flex-col items-center justify-center py-8 px-4">
        <h3 className="text-[30px] font-bold text-secondary">
          Keep in touch with us
        </h3>
        <p className="w-full max-w-[700px] text-[#656766]">
          {settings?.siteSubtitle || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita quaerat unde quam dolor culpa veritatis inventore, aut commodi eum veniam vel'}
        </p>
        {contactDetails?.socials?.length ? (
          <div className="mt-6 flex justify-center">
            <SocialLinks
              socials={contactDetails.socials}
              className="justify-center gap-5 [&_a]:bg-primary/15 [&_a]:text-secondary [&_a:hover]:bg-primary/25 [&_a:hover]:text-primary/90"
            />
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6 md:px-12 lg:px-[100px] py-[60px]">
        {/* Address */}
        <div className="flex justify-start md:justify-center lg:justify-start">
          <div className="flex items-start gap-5 max-w-full">
            <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
              <MapPinned
                strokeWidth={1.5}
                size={32}
                className="text-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-secondary text-[22px] leading-tight">Address</h3>
              <p className="text-[#656766] text-[16px] leading-relaxed break-words">
                {address || 'Address not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex justify-start md:justify-center lg:justify-start">
          <div className="flex items-start gap-5 max-w-full">
            <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
              <Mail
                strokeWidth={1.5}
                size={32}
                className="text-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-secondary text-[22px] leading-tight">Contact</h3>
              <div className="text-[#656766] text-[16px] leading-relaxed">
                <p>Mobile: <span className="font-bold">{safeFormatPhone(contactDetails?.contact)}</span></p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span>E-mail:</span>
                  <a href={`mailto:${contactDetails?.emailAddress}`} className="font-medium text-primary hover:underline break-all">
                    {contactDetails?.emailAddress}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="flex justify-start md:justify-center lg:justify-start md:col-span-2 lg:col-span-1">
          <div className="flex items-start gap-5 w-full max-w-full">
            <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
              <Clock
                strokeWidth={1.5}
                size={32}
                className="text-primary"
              />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <h3 className="font-bold text-secondary text-[22px] leading-tight">Hour of operation</h3>
              
              <div className="flex flex-col gap-4">
                {(() => {
                  if (!schedule) return null;

                  const checkIsOpen = () => {
                    const now = new Date();
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const currentDay = days[now.getDay()];
                    const currentHours = now.getHours().toString().padStart(2, '0');
                    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
                    const currentTime = `${currentHours}:${currentMinutes}`;

                    const todaySchedule = schedule.find(s => s.day === currentDay);

                    if (!todaySchedule || todaySchedule.is_closed) return false;
                    return currentTime >= todaySchedule.open_time && currentTime <= todaySchedule.close_time;
                  };

                  const isOpen = checkIsOpen();

                  return (
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={`font-bold text-[16px] uppercase tracking-wide ${isOpen ? 'text-primary' : 'text-red-500'}`}>
                          {isOpen ? 'Open Now' : 'Closed'}
                        </span>
                    </div>
                  );
                })()}

                {sortedSchedule.length > 0 ? (
                  <ul className="space-y-2 border-t border-gray-100 pt-3">
                    {sortedSchedule.map((slot) => {
                      const isToday = todaySlot?.day === slot.day;
                      return (
                        <li
                          key={slot.day}
                          className={`flex justify-between text-[14px] gap-8 ${isToday ? 'font-bold text-secondary' : 'text-[#656766]'}`}
                        >
                          <span className="w-10">{slot.day.slice(0, 3)}</span>
                          <span className="text-right">
                            {slot.is_closed
                              ? 'Closed'
                              : `${to12Hour(slot.open_time)} – ${to12Hour(slot.close_time)}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-[#656766] text-sm italic">No hours available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
