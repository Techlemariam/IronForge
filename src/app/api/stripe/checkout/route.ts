import { getErrorMessage } from '@/lib/error-message';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

type CheckoutPlan = 'monthly' | 'lifetime';

const CHECKOUT_PLANS = new Set<CheckoutPlan>(['monthly', 'lifetime']);

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not configured');

  return new Stripe(secretKey, {
    apiVersion: '2026-04-22.dahlia',
  });
}

function parseCheckoutPlan(plan: unknown): CheckoutPlan | null {
  return typeof plan === 'string' && CHECKOUT_PLANS.has(plan as CheckoutPlan)
    ? (plan as CheckoutPlan)
    : null;
}

function getPriceId(plan: CheckoutPlan) {
  return plan === 'monthly'
    ? process.env.STRIPE_PRICE_ID_PRO_MONTHLY
    : process.env.STRIPE_PRICE_ID_LIFETIME;
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan: rawPlan } = (await req.json()) as { plan?: unknown };
    const plan = parseCheckoutPlan(rawPlan);

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Ensure customer exists in Stripe
    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email || user.email,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Determine price ID from env
    const priceId = getPriceId(plan);

    if (!priceId) {
      return NextResponse.json({ error: 'Stripe product configuration missing' }, { status: 500 });
    }

    const mode: 'subscription' | 'payment' = plan === 'monthly' ? 'subscription' : 'payment';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json({ error: 'Application URL configuration missing' }, { status: 500 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
      metadata: {
        userId: user.id,
        planType: plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
