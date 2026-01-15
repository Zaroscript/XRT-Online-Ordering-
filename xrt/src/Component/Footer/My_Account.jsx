import React from 'react'
import { MY_ACCOUNT } from '../../config/constants'

export default function My_Account() {
  return (
    <>
        {MY_ACCOUNT.map((info, index) => (
            <li key={index} className="text-[#E1E1E1] py-1 text-[17px]">{info}</li>
        ))}
    </>
  )
}
