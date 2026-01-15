import React from 'react'
import { CATEGORIES_Footer } from '../../config/constants'

export default function Categories() {
  return (
    <>
        {CATEGORIES_Footer.map((info, index) => (
            <li key={index} className="text-[#E1E1E1] py-1 text-[17px]">{info}</li>
        ))}
    </>
  )
}
