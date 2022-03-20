import { useLayoutEffect, useRef, useState } from "react";
import { useTransition } from "remix";

export default function LoadingIndicator() {
  const { location, state } = useTransition();
  const timerRef = useRef<number>();
  const $loader = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  const setWidth = (width: number) => {
    if (!$loader.current) return;

    $loader.current.style.width = `${width}%`;
  };

  const getWidth = () =>
    $loader.current?.style.width
      ? parseFloat($loader.current.style.width)
      : null;

  useLayoutEffect(() => {
    const advanceIndicator = () => {
      clearTimeout(timerRef.current);

      const oldWidth = getWidth() ?? 0;
      setWidth(oldWidth * 0.9 + 10);

      timerRef.current = setTimeout(
        advanceIndicator,
        1000,
      ) as unknown as number;
    };

    const restartIndicator = () => {
      clearTimeout(timerRef.current);

      setWidth(0);
      setIsVisible(true);

      timerRef.current = setTimeout(advanceIndicator, 500) as unknown as number;
    };

    const completeIndicator = () => {
      clearTimeout(timerRef.current);

      if (getWidth() === 0) return;

      setWidth(100);

      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (getWidth() === 100) setWidth(0);
        }, 300);
      }, 500) as unknown as number;
    };

    if (!location || state === "idle" || !$loader.current) return undefined;

    const wasLoading = (getWidth() ?? 0) !== 0;
    restartIndicator();
    if (wasLoading) advanceIndicator();

    return completeIndicator;
  }, [location, state]);

  return (
    <div
      ref={$loader}
      className="fixed top-0 left-0 transition-all duration-300 ease-in-out"
      style={{ opacity: Number(isVisible) }}
    >
      <div className="absolute h-1 w-full bg-primary-focus" />
      <div className="absolute h-1 w-full bg-primary-focus blur-sm" />
    </div>
  );
}
