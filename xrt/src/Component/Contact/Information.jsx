import { Mail, MapPinned, PhoneCall } from "lucide-react";
import React from "react";
import { useSiteSettingsQuery } from "../../api";

export default function Information() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  const schedule = settings?.operating_hours?.schedule;

  return (
    <>
      <div className="text-center flex flex-col items-center justify-center py-8 px-4">
        <h3 className="text-[30px] font-bold text-[#2F3E30]">
          Keep in touch with us
        </h3>
        <p className="w-full max-w-[700px] text-[#656766]">
          {settings?.siteSubtitle || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita quaerat unde quam dolor culpa veritatis inventore, aut commodi eum veniam vel'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-24 lg:gap-x-[150px] px-8 md:px-12 lg:px-[100px] py-[50px]">
        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <MapPinned
              strokeWidth={0.5}
              size={50}
              className="text-[#5D9063] shrink-0"
            />
            <div>
              <h3 className="font-bold text-[#2F3E30] text-[20px] whitespace-nowrap">Address</h3>
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
            <PhoneCall
              strokeWidth={0.5}
              size={50}
              className="text-[#5D9063] shrink-0"
            />
            <div>
              <h3 className="font-bold text-[#2F3E30] text-[20px] whitespace-nowrap">Contact</h3>
              <div className="text-[#656766] py-2 whitespace-nowrap">
                <p>Mobile: <span className="font-bold">{contactDetails?.contact}</span></p>
                <p className="mt-1">E-mail: <a href={`mailto:${contactDetails?.emailAddress}`} className="font-[500] text-[#528959] hover:underline">{contactDetails?.emailAddress}</a></p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-start">
          <div className="flex items-start gap-4">
            <Mail
              strokeWidth={0.5}
              size={50}
              className="text-[#5D9063] shrink-0"
            />
            <div>
              <h3 className="font-bold text-[#2F3E30] text-[20px] whitespace-nowrap">Hour of operation</h3>
              <div className="text-[#656766] py-2 whitespace-nowrap">
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
                        <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-[#5C9963]' : 'bg-red-500'}`}></span>
                        <span className={`font-bold text-[17px] ${isOpen ? 'text-[#5C9963]' : 'text-red-500'}`}>
                          {isOpen ? 'Open Now' : 'Closed'}
                        </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
