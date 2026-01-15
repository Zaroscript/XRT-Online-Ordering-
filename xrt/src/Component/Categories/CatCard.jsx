import React from "react";
import { useNavigate } from "react-router-dom";

const CatCard = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/menu", { state: { selectedCategory: item.name } });
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 rounded-full lg:h-[130px] lg:w-[130px] md:w-[140px] md:h-[140px] w-[200px] h-[200px] cursor-pointer"
      style={{ backgroundColor: item.bg }}
    >
      <img
        src={item.src}
        alt={item.name}
        className="mt-[30px] scale-[1.18] hover:scale-[1.40] duration-300"
      />
      <h2 className="mt-4 text-center font-semibold text-[15px]">
        {item.name}
      </h2>
      <p className="text-center text-gray-400">{item.products + " Products"}</p>
    </div>
  );
};

export default CatCard;
