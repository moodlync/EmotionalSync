import { TOKEN_CONVERSION_RATE, MIN_REDEMPTION_TOKENS } from "@shared/schema";

// Token activities table data
export const TOKEN_ACTIVITIES = [
  {
    name: "Daily Login",
    reward: "0.75",
    frequency: "Daily"
  },
  {
    name: "Journal Entry",
    reward: "0.5",
    frequency: "Per entry (max 3/day)"
  },
  {
    name: "Help Others in Public Chats",
    reward: "0.5",
    frequency: "Per message (max 5/day)"
  },
  {
    name: "Badge Earned",
    reward: "0.5",
    frequency: "One-time per badge"
  },
  {
    name: "Level Up",
    reward: "1.25",
    frequency: "Per level"
  },
  {
    name: "Challenge Completion",
    reward: "0.25",
    frequency: "Per challenge"
  },
  {
    name: "Others Complete Your Challenge",
    reward: "0.75",
    frequency: "Per person"
  },
  {
    name: "First-time Milestone Sharing",
    reward: "5.0",
    frequency: "One-time per milestone"
  }
];

// Premium token bounty opportunities
export const BOUNTY_REWARDS = [
  {
    name: "Weekly Emotional Health Report",
    reward: 2.5,
    description: "Complete a weekly emotional health self-assessment and receive personalized insights."
  },
  {
    name: "Community Content Creation",
    reward: 7.5,
    description: "Create and share original content that helps others manage their emotional health."
  },
  {
    name: "Milestone Achievement Sharing",
    reward: 5.0,
    description: "Share your emotional journey milestones on social media to inspire others."
  },
  {
    name: "Premium Feature Beta Testing",
    reward: 10.0,
    description: "Participate in testing new premium features before they're released to the public."
  },
  {
    name: "Referral Bonus",
    reward: 60.0,
    description: "Earn tokens when a referred user upgrades to a premium subscription (5 subscribers = 300 tokens)."
  }
];

// Premium access token options
export const PREMIUM_TOKEN_ACCESS = [
  {
    name: "1 Week Premium Access",
    tokens: 2500,
    description: "Unlock all premium features for 7 days"
  },
  {
    name: "2 Weeks Premium Access",
    tokens: 4500,
    description: "Unlock all premium features for 14 days"
  },
  {
    name: "3 Weeks Premium Access",
    tokens: 7000,
    description: "Unlock all premium features for 21 days"
  },
  {
    name: "4 Weeks Premium Access",
    tokens: 10000,
    description: "Unlock all premium features for 28 days"
  }
];

// Format currency helper
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Calculate token value helper
export const calculateTokenValue = (tokens: number) => {
  return tokens * TOKEN_CONVERSION_RATE;
};