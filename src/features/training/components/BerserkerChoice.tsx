import React from "react";
import { motion } from "framer-motion";
import ForgeButton from "../../../components/ui/ForgeButton";
import ForgeCard from "../../../components/ui/ForgeCard";

interface BerserkerChoiceProps {
  onAccept: () => void;
  onDecline: () => void;
}

const BerserkerChoice: React.FC<BerserkerChoiceProps> = ({
  onAccept,
  onDecline,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <ForgeCard className="w-full max-w-lg text-center border-yellow-500 shadow-glow-yellow/50">
        <h2 className="font-heading text-3xl text-yellow-400 tracking-wider">
          A New Challenge Appears
        </h2>
        <p className="text-white my-4">
          You are on the verge of victory, but a final test of will remains. Do
          you have the strength to unleash your inner fury for a final, all-out
          set?
        </p>
        <p className="font-mono text-rune mb-6">
          Succeed, and a Legendary reward is guaranteed.
        </p>

        <div className="flex justify-center space-x-4">
          <ForgeButton onClick={onDecline} variant="default">
            End Protocol
          </ForgeButton>
          <ForgeButton
            onClick={onAccept}
            variant="magma"
            className="animate-pulse"
          >
            Unleash Fury
          </ForgeButton>
        </div>
      </ForgeCard>
    </motion.div>
  );
};

export default BerserkerChoice;
