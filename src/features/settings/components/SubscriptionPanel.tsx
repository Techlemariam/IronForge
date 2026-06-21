'use client';

import { toast } from '@/components/ui/GameToast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getErrorMessage } from '@/lib/error-message';
import type { SubscriptionTier } from '@/types/prisma';
import { Check, Crown, Zap } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface SubscriptionPanelProps {
  subscriptionTier: SubscriptionTier;
  subscriptionStatus?: string | null;
}

type CheckoutPlan = 'monthly' | 'lifetime';

type CheckoutResponse = {
  url?: string;
  error?: string;
};

export const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({
  subscriptionTier,
  subscriptionStatus,
}) => {
  const [loadingPlan, setLoadingPlan] = useState<CheckoutPlan | null>(null);

  const handleSubscribe = async (plan: CheckoutPlan) => {
    try {
      setLoadingPlan(plan);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = (await res.json()) as CheckoutResponse;

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Something went wrong'));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Pro Monthly */}
      <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden">
        {subscriptionTier === 'PRO' && (
          <div className="absolute top-0 right-0 bg-magma text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">
            Active
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-magma" /> Pro Tier
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Monthly access to advanced analytics, custom workouts, and AI coaching
            {subscriptionStatus ? ` (${subscriptionStatus})` : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-black text-white">
            $9.99<span className="text-sm text-zinc-500 font-normal">/mo</span>
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Full training history
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Advanced AI Coach (Titan)
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Custom training plans
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          {subscriptionTier === 'PRO' ? (
            <Button variant="outline" className="w-full border-white/10" disabled>
              Current Plan
            </Button>
          ) : (
            <Button
              className="w-full bg-white text-black hover:bg-zinc-200"
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan !== null || subscriptionTier === 'LIFETIME'}
            >
              {loadingPlan === 'monthly' ? 'Initializing...' : 'Upgrade to Pro'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Lifetime Access */}
      <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden ring-1 ring-magma/20">
        {subscriptionTier === 'LIFETIME' && (
          <div className="absolute top-0 right-0 bg-magma text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">
            Active
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-magma via-orange-500 to-yellow-500" />
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-magma" /> Lifetime Access
          </CardTitle>
          <CardDescription className="text-zinc-400">
            One-time payment for permanent access to all Pro features forever.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-black text-white">
            $199<span className="text-sm text-zinc-500 font-normal"> once</span>
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> All Pro Features
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> No recurring fees
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Early access to new modules
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Exclusive 'Founder' title
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          {subscriptionTier === 'LIFETIME' ? (
            <Button variant="outline" className="w-full border-white/10" disabled>
              Unlocked Forever
            </Button>
          ) : (
            <Button
              className="w-full bg-magma text-black hover:bg-orange-500"
              onClick={() => handleSubscribe('lifetime')}
              disabled={loadingPlan !== null}
            >
              {loadingPlan === 'lifetime' ? 'Initializing...' : 'Get Lifetime Access'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
