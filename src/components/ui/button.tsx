import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./buttonVariants";
import { useSoundProtocol } from "@/hooks/useSoundProtocol";
import { useHaptic } from "@/hooks/useHaptic";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  soundType?: "clink" | "thud" | "chirp" | "deploy";
  enableSound?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, soundType, enableSound = true, onClick, ...props }, ref) => {
    const { play } = useSoundProtocol();
    const { trigger } = useHaptic();

    // Map variant to default sound if not specific sound provided
    const effectiveSound = soundType || (
      variant === "plasma" || variant === "magma" || variant === "gold" ? "clink" :
        variant === "ghost" ? "chirp" :
          variant === "default" || variant === "secondary" ? "ui_click" : "thud"
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSound) {
        // play(effectiveSound as any); // Type assertion until sound types are unified
        // Temp fix until types align
        play(effectiveSound as any);
        trigger(variant === "gold" ? "heavy" : "light");
      }
      if (onClick) onClick(e);
    };

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
