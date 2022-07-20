import { Waifu } from "@prisma/client";
import { ReactEventHandler, useRef } from "react";

type Props = {
  waifu: Waifu;
  shouldAnimateOnLoad?: boolean;
};
export default function WaifuCard({
  waifu,
  shouldAnimateOnLoad = false,
}: Props) {
  const wrapperRef = useRef<HTMLImageElement>(null);

  const animateImage: ReactEventHandler<HTMLImageElement> = () => {
    const firstWaifuImg = wrapperRef.current;
    if (firstWaifuImg === null) return;

    firstWaifuImg.style.transform = "Scale(1.2)";

    setTimeout(() => {
      firstWaifuImg.style.transform = "Scale(1.0)";
    }, 150);
  };

  return (
    <div className="flex flex-col items-center space-y-3" cy-data="waifuCard">
      <div
        className="mask mask-squircle h-36 w-36
          transition-all duration-150 ease-in-out
          md:h-48 md:w-48"
        ref={wrapperRef}
      >
        <img
          cy-data="waifuImg"
          className="h-full w-full object-cover"
          src={waifu.img}
          alt={waifu.name}
          onLoad={shouldAnimateOnLoad ? animateImage : undefined}
        />
      </div>
      <span cy-data="waifuName" className="w-36 text-center md:w-48">
        {waifu.name}
      </span>
    </div>
  );
}
