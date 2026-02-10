import React from "react";

export default function Content(props) {
  const {
    src,
    title,
    description,
    subtitleTwo,
    offer,
    btnText = "Order Now",
    btnLink,
  } = props;

  const buttonClass = `
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
    inline-block
    text-center
  `;

  const buttonContent = <span>{btnText}</span>;

  return (
    <div
      style={{ backgroundImage: src ? `url(${src})` : undefined }}
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
        {title ? (
          <h5 className="tracking-[0.25em] text-white font-semibold">
            {title}
          </h5>
        ) : null}

        {description ? (
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#ffb300] leading-tight">
            {description}
          </h2>
        ) : null}

        {subtitleTwo ? (
          <h3 className="text-xl md:text-2xl font-bold text-white mt-2">
            {subtitleTwo}
          </h3>
        ) : null}

        {offer ? (
          <h3 className="text-2xl font-semibold text-[#ffb300]">
            {offer}
          </h3>
        ) : null}

        {btnLink ? (
          <a
            href={btnLink}
            className={buttonClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            {buttonContent}
          </a>
        ) : (
          <button type="button" className={buttonClass}>
            {buttonContent}
          </button>
        )}
      </div>
    </div>
  );
}
