"use client";

import { LazyMotion, domMax } from "framer-motion";

/**
 * AnimationProvider implements framer-motion's LazyMotion.
 * This offloads the main animation logic (~30kb) from the initial bundle
 * into a separate chunk that is loaded only when needed.
 */
export function AnimationProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={domMax} strict>
            {children}
        </LazyMotion>
    );
}
