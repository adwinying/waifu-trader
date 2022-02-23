import { useEffect, useState } from "react";

export const getMsRemaining = (deadline: Date) => +deadline - +new Date();

export const splitTime = (msRemaining: number) => ({
  days: Math.floor(msRemaining / (1000 * 60 * 60 * 24)),
  hours: Math.floor((msRemaining / (1000 * 60 * 60)) % 24),
  minutes: Math.floor((msRemaining / (1000 * 60)) % 60),
  seconds: Math.floor((msRemaining / 1000) % 60),
});

export default function useCountdown(deadline: Date) {
  const [msRemaining, setMsRemaining] = useState(getMsRemaining(deadline));

  useEffect(() => {
    const timerId = setInterval(() => {
      setMsRemaining(getMsRemaining(deadline));
    }, 1000);

    return () => clearInterval(timerId);
  });

  return msRemaining;
}
