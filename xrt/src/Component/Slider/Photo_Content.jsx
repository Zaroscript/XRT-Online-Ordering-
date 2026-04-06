import React from "react";

export default function Content(props) {
  const {
    src,
    videoSrc,
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

  const [isFading, setIsFading] = React.useState(false);
  const videoRef = React.useRef(null);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    
    // Start a gentle fade-out 1 second before the video ends
    if (video.duration - video.currentTime < 1.0 && !isFading) {
      setIsFading(true);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play();
    setIsFading(false);
  };

  return (
    <div
      className="
        relative
        w-full
        h-[620px] md:h-[650px]
        overflow-hidden
        bg-black
      "
    >
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className={`
              absolute
              top-0
              left-0
              w-full
              h-full
              object-cover
              z-0
              transition-opacity
              duration-1000
              ${isFading ? "opacity-0" : "opacity-100"}
            `}
          >
            <source src={videoSrc} />
          </video>
          
          <div className="absolute inset-0 bg-black/40 z-10" />
        </>
      ) : (
        <div
          style={{ backgroundImage: src ? `url(${src})` : undefined }}
          className="
            absolute
            top-0
            left-0
            w-full
            h-full
            bg-cover
            bg-center
            bg-no-repeat
            z-0
          "
        />
      )}

      <div className="
        relative 
        z-20 
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
