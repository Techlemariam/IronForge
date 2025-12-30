import { useEffect, useState } from "react";

export function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      // Easing function: easeOutExpo (snappy start, smooth end)
      const percentage = Math.min(progress / duration, 1);
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

      const nextValue = Math.floor(end * ease);
      setCount(nextValue);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we land exactly on the target
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}
