import React from "react";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";

export default function LandingPage() {
    return (
        <>
            <Hero />
            <div id="features">
                <FeatureGrid />
            </div>
            <Testimonials />
            <div id="pricing">
                <Pricing />
            </div>
        </>
    );
}
