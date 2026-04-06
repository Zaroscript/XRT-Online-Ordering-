import { Mail, MapPinned, Clock } from "lucide-react";
import React from "react";
import { useSiteSettingsQuery } from "../../api";
import { useStoreStatus, to12Hour } from "../../hooks/useStoreStatus";
import SocialLinks from "../Footer/SocialLinks";

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Information() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  const { todaySlot, schedule } = useStoreStatus();

  // Sort schedule by week order
  const sortedSchedule = schedule.length
    ? [...schedule].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
    : [];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-y-12 md:gap-x-24 lg:gap-x-[140px] px-8 md:px-12 lg:px-[100px] py-[50px]">
        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <MapPinned
              strokeWidth={0.5}
              size={50}
              className="text-primary shrink-0"
            />
            <div>
              <h3 className="font-bold text-secondary text-[20px] whitespace-nowrap">Address</h3>
              <p className="text-[#656766] py-2 whitespace-nowrap">
                {[
                  contactDetails?.location?.street_address,
                  contactDetails?.location?.city,
                  contactDetails?.location?.state
                ].filter(Boolean).join(", ") + (contactDetails?.location?.zip ? ` ${contactDetails.location.zip}` : "")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <Mail
              strokeWidth={0.5}
              size={50}
              className="text-primary shrink-0"
            />
            <div>
              <h3 className="font-bold text-secondary text-[20px]">Contact</h3>
              <div className="text-[#656766] max-w-[250px] py-2">
                <p>Mobile: <span className="font-bold">{contactDetails?.contact}</span></p>
                <div className="mt-1 flex items-center gap-1 whitespace-nowrap">
                  <span>E-mail:</span>
                  <a href={`mailto:${contactDetails?.emailAddress}`} className="font-[500] text-[#528959] hover:underline">{contactDetails?.emailAddress}</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start md:col-span-2 lg:col-span-2 xl:col-span-1">
          <div className="flex items-start gap-4">
            <Clock
              strokeWidth={0.5}
              size={50}
              className="text-primary shrink-0"
            />
            <div>
              <h3 className="font-bold text-secondary text-[20px]">Hour of operation</h3>
              <div className="text-[#656766] max-w-[250px] py-2">
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
                        <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-primary' : 'bg-red-500'}`}></span>
                        <span className={`font-bold text-[17px] ${isOpen ? 'text-primary' : 'text-red-500'}`}>
                          {isOpen ? 'Open Now' : 'Closed'}
                        </span>
                    </div>
                  );
                })()}
              </div>
              {sortedSchedule.length > 0 ? (
                <ul className="space-y-1">
                  {sortedSchedule.map((slot) => {
                    const isToday = todaySlot?.day === slot.day;
                    return (
                      <li
                        key={slot.day}
                        className={`flex justify-between text-sm gap-4 ${isToday ? 'font-bold text-secondary' : 'text-[#656766]'}`}
                      >
                        <span className="min-w-[80px]">{slot.day.slice(0, 3)}</span>
                        <span>
                          {slot.is_closed
                            ? 'Closed'
                            : `${to12Hour(slot.open_time)} – ${to12Hour(slot.close_time)}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[#656766] text-sm">No hours available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
