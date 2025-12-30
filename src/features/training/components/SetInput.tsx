import React, { useState } from "react";
import ForgeInput from "../../../components/ui/ForgeInput";
import ForgeButton from "../../../components/ui/ForgeButton";
import { motion } from "framer-motion";

interface SetInputProps {
  onSetLog: (weight: number, reps: number, rpe: number) => void;
  targetReps: number;
  targetRPE: number;
}

const SetInput: React.FC<SetInputProps> = ({
  onSetLog,
  targetReps,
  targetRPE,
}) => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps, 10) || 0;
    const rpeNum = parseFloat(rpe) || 0;
    onSetLog(weightNum, repsNum, rpeNum);
    // Clear for next set
    setWeight("");
    setReps("");
    setRpe("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-obsidian/50 border border-forge-border p-4 rounded-lg mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="grid grid-cols-3 gap-4">
        <ForgeInput
          label="Weight"
          type="number"
          placeholder="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <ForgeInput
          label="Reps"
          type="number"
          placeholder={String(targetReps)}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <ForgeInput
          label="RPE"
          type="number"
          placeholder={String(targetRPE)}
          value={rpe}
          onChange={(e) => setRpe(e.target.value)}
        />
      </div>
      <ForgeButton type="submit" variant="magma" className="w-full mt-4">
        Log Set
      </ForgeButton>
    </motion.form>
  );
};

export default SetInput;
