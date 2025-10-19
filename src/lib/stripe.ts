import { PLANS } from "@/config/stripe";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-08-16",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  // @ts-ignore
  if (!user?.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const dbUser = await db.user.findFirst({
    where: {
      // @ts-ignore
      id: user?.id,
    },
  });

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : PLANS[0]; // Return Free plan when not subscribed

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    try {
      console.log("Calling Stripe API to retrieve subscription:", dbUser.stripeSubscriptionId);
      const stripePlan = await stripe.subscriptions.retrieve(
        dbUser.stripeSubscriptionId
      );
      console.log("Stripe subscription retrieved successfully:", stripePlan.id);
      isCanceled = stripePlan.cancel_at_period_end;
    } catch (error) {
      console.error("Failed to retrieve Stripe subscription:", error);
      // If Stripe API fails, assume not canceled
      isCanceled = false;
    }
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
