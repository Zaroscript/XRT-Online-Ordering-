import React from 'react'
import NavLinks from './NavLinks'

const SubNav = (props) => {
  return (
    <div className='header-container hidden lg:flex  bg-[#3D6642]'>
        <NavLinks className={'flex gap-[30px] bg-[#3D6642] py-[20px] '}/>


        <div className="right_side flex items-center group">
          <div className="rounded-full w-[35px] h-[35px] bg-[#D9E8DB] flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.04)] group-hover:cursor-pointer">
            <i className="fa-duotone fa-regular fa-user-headset text-[#3D6642]"></i>
          </div>
          <h5 className='pl-[5px] text-[#FFA900] font-bold group-hover:cursor-pointer'>{props.phone}</h5>
        </div>
    </div>
  )
}

export default SubNav