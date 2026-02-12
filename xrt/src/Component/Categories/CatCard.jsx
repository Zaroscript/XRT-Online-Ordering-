import React from "react";
import { useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const CatCard = ({ item, index = 0, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      navigate("/menu", { state: { selectedCategory: item.name } });
    }
  };

  // Placeholder images
  const PLACEHOLDER_IMAGE = "https://placehold.co/200x200?text=No+Image";
  const PLACEHOLDER_ICON = "https://placehold.co/200x200?text=Icon";

  // Resolve relative image URLs (e.g. /uploads/...) to API server origin so they load
  const imageSrc = item.image ? (resolveImageUrl(item.image) || PLACEHOLDER_IMAGE) : PLACEHOLDER_IMAGE;
  const iconSrc = item.icon ? (resolveImageUrl(item.icon) || PLACEHOLDER_ICON) : PLACEHOLDER_ICON;

  return (
    <div
      onClick={handleClick}
      className={`group flex flex-col items-center cursor-pointer`}
    >
      <div 
        className="w-[90px] h-[90px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] rounded-full flex items-end justify-center relative mb-3 pb-3"
        style={{ backgroundColor: bgColors[index % bgColors.length] }}
      >
        {/* Desktop Image View */}
        <img
          src={imageSrc}
          alt={item.name}
          className="hidden translate-y-6 lg:block w-[75%] h-[75%] object-contain rounded-full drop-shadow-md transition-transform duration-300 group-hover:scale-110"
        />

        {/* Mobile Icon View */}
        <img
          src={iconSrc}
          alt={item.name}
          className="block lg:hidden w-[75%] h-[75%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <h2 className="text-center font-bold text-gray-800 text-[16px] line-clamp-1 mb-1">
        {item.name}
      </h2>
      
      <p className="text-center text-gray-400 text-sm font-medium">
        {(item.products_count || 0) + " Products"}
      </p>
    </div>
  );
};

const bgColors = [
  "#FDF3C2", // Light Yellow
  "#D9E8C1", // Light Green
  "#F4D5B3", // Light Peach/Beige
  "#A8B985", // Olive Green
  "#EBF285", // Bright Yellow/Green
  "#FDF3C2", // Repeat Yellow
  "#F4D5B3", // Repeat Peach
];

export default CatCard;
