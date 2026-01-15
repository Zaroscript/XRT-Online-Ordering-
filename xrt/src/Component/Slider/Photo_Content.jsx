import React from 'react'

export default function Content(props) {
  return (
    <div
      style={{ backgroundImage: `url(${props.src})` }}
      className="
        relative
        w-full
        h-[520px] md:h-[650px]
        bg-cover
        bg-center
        bg-no-repeat
      "
    >


      <div className="
        relative 
        z-10 
        flex 
        h-full 
        flex-col 
        justify-center 
        items-start 
        text-left
        max-w-[700px]
        pl-10 md:pl-20 
        space-y-4
      ">
        <h5 className="tracking-[0.25em]  text-white font-semibold">
          {props.title}
        </h5>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          {props.description}
        </h2>

        <h3 className="text-2xl font-semibold text-[#ffb300]">
          {props.offer}
        </h3>

        <button className="
          bg-white 
          text-black 
          font-semibold 
          px-8 
          py-3 
          mt-[30px]
          rounded-full 
          shadow-md
          hover:bg-[#469950]
          hover:text-white
          duration-300
          cursor-pointer
        ">
          Order Now
        </button>
      </div>
    </div>
  )
}
