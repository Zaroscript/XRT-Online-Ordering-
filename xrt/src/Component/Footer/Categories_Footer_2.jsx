import React from 'react'
import { CATEGORIES_Footer_2 } from '../../config/constants'

export default function Categories_2() {
  return (
    <>
        {CATEGORIES_Footer_2.map((info, index) => (
            <li key={index} className="text-[#E1E1E1] py-1 text-[17px]">{info}</li>
        ))}
    </>
  )
}
