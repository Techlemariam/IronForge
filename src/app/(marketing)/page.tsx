import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { Hero } from '@/components/marketing/Hero';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Pricing } from '@/components/marketing/Pricing';
import { Testimonials } from '@/components/marketing/Testimonials';
import React from 'react';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
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
