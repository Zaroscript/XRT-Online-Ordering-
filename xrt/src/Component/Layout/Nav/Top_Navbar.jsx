import React from 'react'
import '@/assets/style/header.css'

export default function Top_Navbar(props) {
  return (
    <>
        <div className='bg-[#F2F7F3] py-[8px] flex header-container nav'>
            <h6 className='text-gray-500 lg:text-[14px] md:text-[12px] text-[9px]'>{props.address}</h6>
            <a href={props.email}>
              <div className="right_side flex items-center cursor-pointer group">
                <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
                  <i className="fa-regular fa-envelope   text-green-500"></i>
                </div>
                <h5 className='text-gray-500 font-normal lg:text-[14px] md:text-[12px] text-[9px] duration-500 group-hover:text-[#58d793]'>{props.email}</h5>
              </div>
            </a>
        </div>
    </>
  )
}
