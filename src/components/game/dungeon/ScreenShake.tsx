import React, { ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";

interface ScreenShakeProps {
  children: ReactNode;
  intensity?: number; // 0 to 1
  triggerKey?: string | number; // Change this to trigger shake
}

/**
 * ScreenShake Wrapper
 * Wraps content and shakes it when `triggerKey` changes.
 * Intensity determines the violence of the shake.
 */
const ScreenShake: React.FC<ScreenShakeProps> = ({
  children,
  intensity = 0.5,
  triggerKey,
}) => {
  const controls = useAnimation();

  React.useEffect(() => {
    if (triggerKey) {
      const shakeAmount = 10 * intensity;
      controls.start({
        x: [
          0,
          -shakeAmount,
          shakeAmount,
          -shakeAmount * 0.5,
          shakeAmount * 0.5,
          0,
        ],
        y: [0, -shakeAmount * 0.5, shakeAmount * 0.5, 0],
        transition: { duration: 0.4, ease: "easeInOut" },
      });
    }
  }, [triggerKey, intensity, controls]);

  return <motion.div animate={controls}>{children}</motion.div>;
};

export default ScreenShake;
