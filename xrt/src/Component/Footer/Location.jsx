import React from 'react'
import { STORE_LOCATION } from '../../config/constants'
import { Phone } from 'lucide-react'

export default function Location() {
  return (
    <>
        <li className='text-[#E1E1E1] mt-3 text-[17px] '>{STORE_LOCATION.location}</li>
        <li className='flex mt-4'> 
            <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
                <i className="fa-regular fa-envelope   text-[#5C9963]"></i>
            </div>
            <span className='mt-2 text-[#E1E1E1] text-[17px]'>{STORE_LOCATION.mail}</span>
        </li>
        <li className='flex mt-4'>
            <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
                <Phone strokeWidth={3} className='text-[#5C9963]' size={18}/>
            </div>
            <span className='mt-2 text-[#E1E1E1] text-[17px]'>{STORE_LOCATION.phone}</span>
        </li>
    </>
  )
}
