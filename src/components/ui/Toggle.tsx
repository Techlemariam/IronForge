import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  ariaLabel: string;
}

export const Toggle: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  className = "",
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? "true" : "false"}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rarity-epic focus:ring-offset-2 focus:ring-offset-void ${checked ? "bg-rarity-epic" : "bg-gray-700"} ${className}`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? "translate-x-7" : ""}`}
      ></div>
    </button>
  );
};
