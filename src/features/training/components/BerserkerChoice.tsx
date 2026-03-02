import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
      <Card variant="glass" className="w-full max-w-lg text-center border-yellow-500 shadow-glow-yellow/50">
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
          <Button onClick={onDecline} variant="default">
            End Protocol
          </Button>
          <Button
            onClick={onAccept}
            variant="magma"
            className="animate-pulse"
          >
            Unleash Fury
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default BerserkerChoice;


