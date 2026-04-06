import React from 'react'
import { Link } from 'react-router-dom'
import { useCategoriesQuery } from '@/api'

export default function Categories() {
  const { categories, loading } = useCategoriesQuery();

  if (loading) {
    return (
      <li className="text-[#E1E1E1] opacity-50 py-1 text-[17px]">Loading...</li>
    )
  }

  // Ensure categories are unique by name
  const uniqueCategories = categories?.filter(
    (item, index, self) => index === self.findIndex((t) => t.name === item.name)
  ) || [];

  return (
    <>
        {uniqueCategories.map((item, index) => (
            <li key={item._id || index} className="text-[#E1E1E1] py-1 text-[17px]">
              <Link to={`/menu?category=${encodeURIComponent(item.name)}`}>
                {item.name}
              </Link>
            </li>
        ))}
    </>
  )
}
