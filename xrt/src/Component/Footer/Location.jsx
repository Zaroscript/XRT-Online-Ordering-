import React from "react";
import { Phone } from "lucide-react";
import { useSiteSettingsQuery } from "../../api";

export default function Location() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;

  return (
    <>
      <li className="text-[#E1E1E1] mt-3 text-[17px] ">
        {[
          contactDetails?.location?.street_address,
          contactDetails?.location?.city,
          contactDetails?.location?.state,
        ]
          .filter(Boolean)
          .join(", ")}
      </li>
      <li className="flex mt-4">
        <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
          <i className="fa-regular fa-envelope   text-[#5C9963]"></i>
        </div>
        <span className="mt-2 text-[#E1E1E1] text-[17px]">
          {contactDetails?.emailAddress}
        </span>
      </li>
      <li className="flex mt-4">
        <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
          <Phone strokeWidth={3} className="text-[#5C9963]" size={18} />
        </div>
        <span className="mt-2 text-[#E1E1E1] text-[17px]">
          {contactDetails?.contact}
        </span>
      </li>
    </>
  );
}
