export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: "free",
    name: "Free Tier",
    commissionRate: 0.1, // 10%
    priority: 1,
    fee: 0,
    benefits: ["Standard visibility", "Standard matching"],
  },
  PREMIUM_WEEKLY: {
    id: "premium_weekly",
    name: "Premium Weekly",
    commissionRate: 0.05, // 5%
    priority: 2,
    fee: 2000,
    durationDays: 7,
    benefits: ["Lower commission (5%)", "More ride visibility", "Priority matching"],
  },
  PREMIUM_MONTHLY: {
    id: "premium_monthly",
    name: "Premium Monthly",
    commissionRate: 0.03, // 3%
    priority: 3,
    fee: 5000,
    durationDays: 30,
    benefits: ["Lowest commission (3%)", "Maximum ride visibility", "Priority matching"],
  },
};

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_TIERS;
