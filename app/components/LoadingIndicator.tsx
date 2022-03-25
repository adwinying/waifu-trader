import { useEffect, useRef, useState } from "react";
import { useTransition } from "remix";

import useInterval from "~/hooks/useInterval";

export default function LoadingIndicator() {
  const { location, state } = useTransition();
  const completedTimerRef = useRef<number>();

  const [width, setWidth] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const isActive = location && state !== "idle";
  const delay = rounds > 0 ? 1000 : 500;

  const restartIndicator = () => {
    // if loading animation was shown then set to 10%, else set to 0%
    setWidth((w) => (w === 0 ? 0 : 10));
    setRounds(0);
    setIsVisible(true);
  };
  const advanceIndicator = () => {
    setWidth((w) => w * 0.9 + 10);
    setRounds((r) => r + 1);
  };
  const completeIndicator = () => {
    // if loading animation was not shown then do nothing,
    // else show loading animation filled
    setWidth((w) => (w === 0 ? 0 : 100));

    // delay fade off
    completedTimerRef.current = setTimeout(() => {
      setIsVisible(false);

      // delay width reset
      setTimeout(() => setWidth((w) => (w === 100 ? 0 : w)), 300);
    }, 500) as unknown as number;
  };

  useInterval(advanceIndicator, isActive ? delay : null);

  useEffect(() => {
    if (!isActive) return undefined;

    clearTimeout(completedTimerRef.current);

    restartIndicator();

    return completeIndicator;
  }, [isActive]);

  return (
    <div
      className="fixed top-0 left-0 transition-all duration-300 ease-in-out"
      style={{ width: `${width}%`, opacity: Number(isVisible) }}
    >
      <div className="absolute h-1 w-full bg-primary-focus" />
      <div className="absolute h-1 w-full bg-primary-focus blur-sm" />
    </div>
  );
}
