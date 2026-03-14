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
    bg-white/20
    backdrop-blur-md
    text-white 
    font-semibold 
    px-8 
    py-3 
    rounded-full 
    shadow-md
    hover:bg-white/40
    duration-300
    cursor-pointer
    inline-block
    text-center
    capitalize
  `;

  const buttonContent = <span>{btnText}</span>;

  return (
    <div
      style={{ backgroundImage: src ? `url(${src})` : undefined }}
      className="
        relative
        w-full
        h-[620px] md:h-[650px]
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
        items-center 
        text-center
        max-w-[700px]
        mx-auto
        px-4
        space-y-4
        pb-20 md:pb-25
      ">
        {title ? (
          <h5 className="tracking-[0.25em] text-white font-semibold uppercase">
            {title}
          </h5>
        ) : null}

        {description ? (
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight capitalize">
            {description}
          </h2>
        ) : null}

        {subtitleTwo ? (
          <h3 className="text-xl md:text-2xl font-bold text-white mt-2">
            {subtitleTwo}
          </h3>
        ) : null}

        {offer ? (
          <h3 className="text-3xl font-bold text-[#ffb300] capitalize">
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
