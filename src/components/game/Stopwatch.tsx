import React, { useState, useEffect } from "react";

interface StopwatchProps {
  startTime: Date;
}

const Stopwatch: React.FC<StopwatchProps> = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startTime.getTime();

      const hours = Math.floor(difference / (1000 * 60 * 60))
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, "0");

      setElapsedTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="font-mono text-xl text-rune tracking-widest">
      {elapsedTime}
    </div>
  );
};

export default Stopwatch;
