import { useEffect, useRef, useState } from "react";

type Options = {
  active: boolean;
  durationSeconds: number;
  resetKey: string;
  onExpire: () => void;
};

export function useCountdown({ active, durationSeconds, resetKey, onExpire }: Options) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (active) {
      setRemainingSeconds(durationSeconds);
      setExpired(false);
    } else if (!expired) {
      setRemainingSeconds(null);
    }
  }, [active, durationSeconds, resetKey]);

  useEffect(() => {
    if (!active || remainingSeconds === null || remainingSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      if (remainingSeconds === 1) {
        setRemainingSeconds(0);
        setExpired(true);
        onExpireRef.current();
      } else {
        setRemainingSeconds(remainingSeconds - 1);
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [active, remainingSeconds]);

  return { remainingSeconds, expired };
}
