import React from 'react';
import { DetailedProductDialog, FeatureIcons, StaticProductDialog, StaticProductDescriptionProps } from './detailed-product-description';
import { useLocation } from 'wouter';

// Helper component for features requiring navigation - must be used as a React component
export const LearnMoreButton = ({ 
  path, 
  text = "Learn More", 
  description 
}: { 
  path?: string, 
  text?: string, 
  description?: StaticProductDescriptionProps 
}) => {
  const [, navigate] = useLocation();
  
  if (description) {
    return (
      <StaticProductDialog 
        description={description} 
        onCtaClick={path ? () => navigate(path) : undefined} 
      />
    );
  }
  
  return (
    <DetailedProductDialog
      triggerText={text}
      title="Feature Details"
      description="Learn more about this feature"
      features={[]}
      ctaAction={() => navigate && navigate(path)}
    />
  );
};

// IMPORTANT: These description objects are meant to be imported as static objects,
// not used as React components. They should NOT use React hooks!

// Emotion Matching Description
export const EmotionMatchingDescription = {
  triggerText: "Learn More",
  title: "Emotion Matching",
  subtitle: "Connect with others who share your emotional state",
  description: "Our innovative emotion matching technology analyzes facial expressions, voice patterns, and self-reported feelings to connect you with others experiencing similar emotions worldwide. Build meaningful relationships based on shared emotional experiences in real-time.",
  imageSrc: "/assets/premium-features/emotion-matching.jpg",
  imageAlt: "Emotion Matching",
  badgeText: "Core Feature",
  features: [
    {
      title: "AI-Powered Emotion Detection",
      description: "Advanced algorithms detect your emotions through facial expressions, voice analysis, or manual selection with high accuracy",
      icon: FeatureIcons.Brain
    },
    {
      title: "Global Connection Pool",
      description: "Find matches from our worldwide user base experiencing similar emotions for authentic conversations",
      icon: FeatureIcons.Heart
    },
    {
      title: "Privacy Controls",
      description: "Set your matching preferences and control exactly what emotional data is shared with others",
      icon: FeatureIcons.Shield
    },
    {
      title: "Meaningful Interactions",
      description: "Skip the small talk and connect on a deeper level through shared emotional experiences",
      icon: FeatureIcons.HandHeart
    }
  ],
  ctaText: "Try Emotion Matching"
};

// Emotional Journal Description
export const EmotionalJournalDescription = {
  triggerText: "Learn More",
  title: "Emotional Journal",
  subtitle: "Track your emotional journey over time",
  description: "Record, track, and analyze your emotions over time with our comprehensive emotional journal. Gain valuable insights into your emotional patterns, triggers, and growth with AI-powered analytics that help you understand your emotional health better.",
  imageSrc: "/assets/premium-features/emotional-journal.jpg",
  imageAlt: "Emotional Journal",
  badgeText: "Core Feature",
  features: [
    {
      title: "Daily Emotion Tracking",
      description: "Record your emotions, intensity levels, and contextual notes to build a comprehensive emotional diary",
      icon: FeatureIcons.PenLine
    },
    {
      title: "Visual Analytics",
      description: "View beautiful charts and visualizations of your emotional patterns over days, weeks, and months",
      icon: FeatureIcons.Brain
    },
    {
      title: "AI Insights",
      description: "Receive personalized insights about your emotional triggers, patterns, and suggestions for growth",
      icon: FeatureIcons.Star
    },
    {
      title: "Private & Secure",
      description: "Your journal entries are completely private and protected with end-to-end encryption",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "Start Your Journal"
};

// Emotional NFTs Description
export const EmotionalNFTsDescription = {
  triggerText: "Learn More",
  title: "Emotional NFTs",
  subtitle: "Exclusive digital collectibles representing your emotional milestones",
  description: "MoodSync's Emotional NFTs are unique digital collectibles that represent significant emotional milestones in your journey. These NFTs evolve as you progress, providing visual representations of your emotional growth and unlocking real-world benefits.",
  imageSrc: "/assets/emotional-nfts/emotional-nfts-main.jpg",
  imageAlt: "Emotional NFTs",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Dynamic Evolution",
      description: "Your NFTs evolve visually based on your emotional growth and progress on the platform",
      icon: FeatureIcons.Star
    },
    {
      title: "Achievement-Based",
      description: "Earn NFTs by reaching significant milestones like emotional growth streaks or helping others",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Real-World Benefits",
      description: "Unlock exclusive platform privileges, partner discounts, and special access with your NFTs",
      icon: FeatureIcons.Star
    },
    {
      title: "Privacy-Focused",
      description: "Zero-Knowledge Proofs allow you to prove NFT ownership without revealing private emotional data",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "Explore NFT Collection"
};

// Advanced Analytics Description
export const AdvancedAnalyticsDescription = {
  triggerText: "Learn More",
  title: "Advanced Analytics",
  subtitle: "Gain deep insights into your emotional patterns",
  description: "Our premium Advanced Analytics tools provide comprehensive insights into your emotional patterns, correlations with external factors, and personalized recommendations for emotional wellness. Visualize your journey with interactive charts and AI-powered analysis.",
  imageSrc: "/assets/premium-features/advanced-analytics.jpg",
  imageAlt: "Advanced Analytics",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Interactive Visualizations",
      description: "Explore your emotional data through beautiful, interactive charts and heatmaps",
      icon: FeatureIcons.Brain
    },
    {
      title: "Pattern Recognition",
      description: "Our AI identifies correlations between your emotions and external factors like weather, sleep, and activities",
      icon: FeatureIcons.Brain
    },
    {
      title: "Comparative Analysis",
      description: "Benchmark your emotional wellness against anonymized data from similar demographic groups",
      icon: FeatureIcons.Star
    },
    {
      title: "Personalized Recommendations",
      description: "Receive tailored suggestions to improve emotional well-being based on your unique patterns",
      icon: FeatureIcons.HandHeart
    }
  ],
  ctaText: "Upgrade for Analytics"
};

// Emotional Imprints Description
export const EmotionalImprintsDescription = {
  triggerText: "Learn More",
  title: "Emotional Imprints",
  subtitle: "Create and share multi-sensory emotional snapshots",
  description: "Emotional Imprints allows you to capture your emotional state as a multi-sensory experience combining colors, sounds, and haptic feedback. Share these emotional snapshots with friends or save them as personal memories that you can revisit and experience again.",
  imageSrc: "/assets/premium-features/emotional-imprints.jpg",
  imageAlt: "Emotional Imprints",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Multi-Sensory Capture",
      description: "Record your emotion as a unique combination of colors, sounds, and vibration patterns",
      icon: FeatureIcons.Fingerprint
    },
    {
      title: "Emotional Time Capsules",
      description: "Save imprints to revisit later, allowing you to re-experience past emotional states",
      icon: FeatureIcons.PenLine
    },
    {
      title: "Selective Sharing",
      description: "Share your emotional imprints with specific friends or family members with granular controls",
      icon: FeatureIcons.Heart
    },
    {
      title: "Sensory Customization",
      description: "Personalize how your emotions are translated into sensory experiences with custom themes",
      icon: FeatureIcons.Star
    }
  ],
  ctaText: "Create an Imprint"
};

// AI Video Editor Description
export const AIVideoEditorDescription = {
  triggerText: "Learn More",
  title: "AI Video Editor",
  subtitle: "Create professional videos with AI-powered tools",
  description: "Our premium AI Video Editor helps you create professional-quality videos that express your emotions visually. Leverage cutting-edge AI technology to automatically edit footage, enhance quality, generate emotionally-relevant music, and create stunning visual effects that match your emotional intent.",
  imageSrc: "/assets/premium-features/ai-video-editor.jpg",
  imageAlt: "AI Video Editor",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Emotion-Based Editing",
      description: "AI suggests edits and effects based on the emotional tone you want to convey in your video",
      icon: FeatureIcons.Brain
    },
    {
      title: "Automated Enhancement",
      description: "One-click processing for color correction, stabilization, audio enhancement, and more",
      icon: FeatureIcons.Star
    },
    {
      title: "Musical Scoring",
      description: "Generate custom background music that matches the emotional journey of your video",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Secure Cloud Storage",
      description: "Store your video projects securely in the cloud with generous storage allocation",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "Try Video Editor"
};

// Family Plan Access Description
export const FamilyPlanDescription = {
  triggerText: "Learn More",
  title: "Family Plan Access",
  subtitle: "Monitor family members' emotional wellbeing with consent",
  description: "Our Family Plan feature allows you to create a private emotional support network with your loved ones. With proper consent, monitor the emotional wellbeing of family members, receive notifications about significant emotional changes, and provide timely support when needed.",
  imageSrc: "/assets/attached_assets/IMG_4689.jpg",
  imageAlt: "Family Plan Access",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Consent-Based Monitoring",
      description: "Family members explicitly control what emotional data they share with you through granular permissions",
      icon: FeatureIcons.Shield
    },
    {
      title: "Emotional Alerts",
      description: "Receive discreet notifications when family members experience significant emotional changes",
      icon: FeatureIcons.Heart
    },
    {
      title: "Support Suggestions",
      description: "Get AI-powered recommendations for how to best support a family member based on their emotional state",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Family Group Chat",
      description: "Private, encrypted group messaging to maintain connection with your entire family",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "Explore Family Plan"
};

// Token Rewards System Description
export const TokenRewardsDescription = {
  triggerText: "Learn More",
  title: "Token Rewards System",
  subtitle: "Earn tokens for positive engagement and emotional growth",
  description: "Our comprehensive Token Rewards System incentivizes healthy emotional habits and community contributions. Earn tokens through daily activities, helping others, completing challenges, and reaching personal milestones. Redeem your tokens for premium features, real-world benefits, or exclusive NFTs.",
  imageSrc: "/assets/premium-features/token-rewards-system-new.jpg",
  imageAlt: "Token Rewards System",
  badgeText: "Core Feature",
  features: [
    {
      title: "Daily Earnings",
      description: "Earn tokens through regular platform activities like journaling, helping others, and completing challenges",
      icon: FeatureIcons.Star
    },
    {
      title: "Milestone Bonuses",
      description: "Receive token bonuses for reaching emotional growth milestones and streaks",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Flexible Redemption",
      description: "Exchange tokens for premium features, subscription time, exclusive NFTs, or cash out via approved methods",
      icon: FeatureIcons.Star
    },
    {
      title: "Transparent Tokenomics",
      description: "Clear, fair token economy with published earning rates and anti-exploitation safeguards",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "View Token Center"
};

// Verified Badge Description
export const VerifiedBadgeDescription = {
  triggerText: "Learn More",
  title: "Premium Verification",
  subtitle: "Get verified with a premium badge to build trust",
  description: "Premium members receive a verified badge displayed on their profile, indicating their commitment to the MoodSync community and establishing credibility with other users. This verification badge helps create trust and identifies you as an active, premium community member.",
  imageSrc: "/assets/attached_assets/IMG_4686.jpg",
  imageAlt: "Premium Verification",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Identity Verification",
      description: "Receive a verification badge after our verification team confirms your profile authenticity",
      icon: FeatureIcons.Shield
    },
    {
      title: "Profile Prominence",
      description: "Stand out in search results, recommendations, and community areas with your verification badge",
      icon: FeatureIcons.Star
    },
    {
      title: "Boosted Trust",
      description: "Build stronger connections as others recognize your verified status in the community",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Access to Verified Zones",
      description: "Join exclusive chat rooms and events only available to verified premium members",
      icon: FeatureIcons.Star
    }
  ],
  ctaText: "Get Verified"
};

// Private Chats Description
export const PrivateChatsDescription = {
  triggerText: "Learn More",
  title: "Private Chats",
  subtitle: "End-to-end encrypted private conversations",
  description: "Premium members have access to enhanced private chat features with end-to-end encryption, disappearing messages, and advanced privacy controls. Enjoy more personalized and secure conversations with others in the MoodSync community.",
  imageSrc: "/assets/attached_assets/IMG_4687.jpg",
  imageAlt: "Private Chats",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "End-to-End Encryption",
      description: "All messages are encrypted with the Signal Protocol, ensuring only you and your recipient can read them",
      icon: FeatureIcons.Shield
    },
    {
      title: "Disappearing Messages",
      description: "Set messages to automatically delete after a specified time for enhanced privacy",
      icon: FeatureIcons.Star
    },
    {
      title: "Read Receipts Control",
      description: "Choose whether others can see when you've read their messages",
      icon: FeatureIcons.Shield
    },
    {
      title: "Enhanced Media Sharing",
      description: "Share high-resolution photos and longer videos in private chats",
      icon: FeatureIcons.HandHeart
    }
  ],
  ctaText: "Try Private Chats"
};

// Ad Space Description
export const AdSpaceDescription = {
  triggerText: "Learn More",
  title: "Premium Ad Space",
  subtitle: "Advertise your professional services to the community",
  description: "Premium members who offer health and wellness services can advertise their services on the MoodSync platform. Create a professional listing that reaches users who may benefit from your expertise, all within our supportive community environment.",
  imageSrc: "/assets/attached_assets/IMG_4688.jpg",
  imageAlt: "Ad Space",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Professional Listing",
      description: "Create a verified listing showcasing your health, wellness, or mental health services",
      icon: FeatureIcons.Star
    },
    {
      title: "Targeted Visibility",
      description: "Your services are recommended to users whose emotional patterns match your area of expertise",
      icon: FeatureIcons.Brain
    },
    {
      title: "Booking Integration",
      description: "Allow community members to schedule consultations directly through your listing",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Review System",
      description: "Build trust through verified reviews from clients who found you through MoodSync",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "Create Your Listing"
};

// Mood Games Description
export const MoodGamesDescription = {
  triggerText: "Learn More",
  title: "Mood Games",
  subtitle: "Fun games designed to improve emotional intelligence",
  description: "Premium members gain access to our suite of interactive games specifically designed to improve emotional intelligence, mindfulness, and mood regulation. These engaging games make emotional growth fun while teaching valuable skills through play.",
  imageSrc: "/assets/img/mood-games.jpg",
  imageAlt: "Mood Games",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Emotion Recognition",
      description: "Games that help you identify subtle emotions in facial expressions and voice tones",
      icon: FeatureIcons.Brain
    },
    {
      title: "Mood Regulation",
      description: "Interactive exercises that teach techniques for managing difficult emotions",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Multiplayer Challenges",
      description: "Team up with friends to complete emotional intelligence challenges together",
      icon: FeatureIcons.Heart
    },
    {
      title: "Progress Tracking",
      description: "Track your emotional intelligence growth over time with detailed stats",
      icon: FeatureIcons.Star
    }
  ],
  ctaText: "Play Now"
};

// Custom Themes Description
export const CustomThemesDescription = {
  triggerText: "Learn More",
  title: "Custom Themes",
  subtitle: "Personalize your MoodSync experience",
  description: "Premium members can fully customize the look and feel of their MoodSync experience with exclusive color themes, fonts, and interface options. Express your personality through your app's appearance with our advanced theming system.",
  imageSrc: "/assets/img/custom-themes.jpg",
  imageAlt: "Custom Themes",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Color Palette Creator",
      description: "Design your own color scheme or choose from premium exclusive palettes",
      icon: FeatureIcons.PenLine
    },
    {
      title: "Premium Fonts",
      description: "Access to a library of premium typography options not available in the standard version",
      icon: FeatureIcons.Star
    },
    {
      title: "Interface Layouts",
      description: "Choose from multiple UI layouts to optimize for your personal workflow",
      icon: FeatureIcons.Brain
    },
    {
      title: "Seasonal Themes",
      description: "Access limited-edition seasonal themes throughout the year",
      icon: FeatureIcons.HandHeart
    }
  ],
  ctaText: "Customize Your Theme"
};

// Mood Backgrounds Description
export const MoodBackgroundsDescription = {
  triggerText: "Learn More",
  title: "Mood-Synced Backgrounds",
  subtitle: "Dynamic backgrounds that reflect your emotional state",
  description: "Premium members enjoy interactive backgrounds that subtly shift based on their current emotional state. This feature provides a visual representation of your emotions and creates an immersive, personalized experience as you use the app.",
  imageSrc: "/assets/attached_assets/IMG_4690.jpg",
  imageAlt: "Mood Backgrounds",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Dynamic Color Transitions",
      description: "Background colors shift subtly to reflect changes in your emotional state",
      icon: FeatureIcons.PenLine
    },
    {
      title: "Custom Emotion Mappings",
      description: "Define which colors and patterns represent different emotions for you personally",
      icon: FeatureIcons.Star
    },
    {
      title: "Animated Elements",
      description: "Gentle animations respond to emotional intensity and transitions",
      icon: FeatureIcons.Brain
    },
    {
      title: "Environment Integration",
      description: "Optional integration with time of day and local weather for enhanced immersion",
      icon: FeatureIcons.HandHeart
    }
  ],
  ctaText: "Activate Mood Backgrounds"
};

// Token Milestones Description
export const TokenMilestonesDescription = {
  triggerText: "Learn More",
  title: "Token Milestone Celebrations",
  subtitle: "Special visual effects for your achievements",
  description: "Premium members receive enhanced celebrations when reaching token milestones. Enjoy personalized confetti bursts, animation sequences, and special effects when you reach significant token amounts or complete token-based challenges.",
  imageSrc: "/assets/attached_assets/IMG_4692.jpg",
  imageAlt: "Token Milestones",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Custom Celebration Effects",
      description: "Personalized visual celebrations when you reach token milestones",
      icon: FeatureIcons.Star
    },
    {
      title: "Social Sharing",
      description: "Generate beautiful milestone cards to share your achievements with friends",
      icon: FeatureIcons.Heart
    },
    {
      title: "Achievement Showcase",
      description: "Display your most impressive token milestones on your profile",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Milestone Badges",
      description: "Earn exclusive badges for significant token achievements",
      icon: FeatureIcons.Star
    }
  ],
  ctaText: "View Token Milestones"
};

// Social Sharing Description
export const SocialSharingDescription = {
  triggerText: "Learn More",
  title: "Animated Social Sharing",
  subtitle: "Share your achievements with beautiful animations",
  description: "Premium members can create and share beautifully animated posts about their emotional growth milestones, achievements, and insights. Express your journey with eye-catching, customizable animations that make sharing meaningful moments more engaging.",
  imageSrc: "/assets/attached_assets/IMG_4693.jpg",
  imageAlt: "Animated Social Sharing",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Animated Templates",
      description: "Choose from dozens of premium animation templates for sharing your achievements",
      icon: FeatureIcons.Star
    },
    {
      title: "Custom Animation Editor",
      description: "Modify animations with our intuitive editor to match your personal style",
      icon: FeatureIcons.PenLine
    },
    {
      title: "Cross-Platform Sharing",
      description: "Optimized for sharing on all major social platforms with platform-specific formats",
      icon: FeatureIcons.HandHeart
    },
    {
      title: "Privacy Controls",
      description: "Granular control over what emotional data is shared in your animations",
      icon: FeatureIcons.Shield
    }
  ],
  ctaText: "Create Animated Share"
};

// Health Services Marketplace Description
export const HealthServicesDescription = {
  triggerText: "Learn More",
  title: "Health Services Marketplace",
  subtitle: "Access verified health and wellness professionals",
  description: "Access our exclusive marketplace of verified mental health professionals, wellness coaches, and emotional support specialists. Premium members can discover services, book appointments, and get personalized recommendations based on their emotional needs and journey.",
  imageSrc: "/assets/attached_assets/IMG_4697.jpg",
  imageAlt: "Health Services Marketplace",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Verified Professionals",
      description: "All service providers undergo rigorous verification to ensure quality and credentials",
      icon: FeatureIcons.Shield
    },
    {
      title: "Personalized Matching",
      description: "AI-powered recommendations based on your emotional profile and specific needs",
      icon: FeatureIcons.Brain
    },
    {
      title: "Secure Bookings",
      description: "Book appointments and consultations directly within the platform with secure payment",
      icon: FeatureIcons.Shield
    },
    {
      title: "Premium Discounts",
      description: "Exclusive discounts and priority bookings available only to premium members",
      icon: FeatureIcons.Star
    }
  ],
  ctaText: "Explore Health Services"
};

// Advanced Emoji Reaction System Description
export const AdvancedEmojiDescription = {
  triggerText: "Learn More",
  title: "Advanced Emoji System",
  subtitle: "Express emotions with nuanced emoji reactions",
  description: "Our advanced emoji reaction system allows for a more nuanced expression of emotions. With premium access, you can utilize our expanded library of emotion-specific emojis to respond to content and in conversations, helping you communicate your emotional reactions with greater precision.",
  imageSrc: "/assets/attached_assets/IMG_4694.jpg",
  imageAlt: "Advanced Emoji System",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Emotion Intensity Slider",
      description: "Adjust the intensity of your emoji reactions to show subtle differences in emotional responses",
      icon: FeatureIcons.Brain
    },
    {
      title: "Custom Emoji Creation",
      description: "Design and save your own personalized emoji reactions for emotions unique to you",
      icon: FeatureIcons.PenLine
    },
    {
      title: "Reaction Collections",
      description: "Organize your most-used reactions into custom collections for quick access",
      icon: FeatureIcons.Star
    },
    {
      title: "Animated Responses",
      description: "Access to animated emoji reactions that better express complex or changing emotions",
      icon: FeatureIcons.Fingerprint
    }
  ],
  ctaText: "Explore Emoji System"
};

// Classical Music Therapy Description
export const ClassicalMusicDescription = {
  triggerText: "Learn More",
  title: "Classical Music Therapy",
  subtitle: "Curated classical selections for emotional wellbeing",
  description: "Discover the healing power of music with our expertly curated classical music therapy feature. Access exclusive playlists designed by music therapists to help manage stress, anxiety, and other emotional states through the profound emotional resonance of classical compositions.",
  imageSrc: "/assets/attached_assets/IMG_4695.jpg",
  imageAlt: "Classical Music Therapy",
  badgeText: "Premium Feature",
  premiumFeature: true,
  features: [
    {
      title: "Expert Curation",
      description: "Playlists curated by certified music therapists and classical music experts for emotional healing",
      icon: FeatureIcons.Brain
    },
    {
      title: "Emotion-Based Selection",
      description: "Music recommendations based on your current emotional state to enhance or transform your mood",
      icon: FeatureIcons.Heart
    },
    {
      title: "High-Fidelity Audio",
      description: "Premium sound quality with lossless audio streams for the full therapeutic effect",
      icon: FeatureIcons.Star
    },
    {
      title: "Guided Listening Sessions",
      description: "Therapeutic listening guides that help you use the music for maximum emotional benefit",
      icon: FeatureIcons.HandHeart
    }
  ],
  ctaText: "Try Music Therapy"
};

// Export all descriptions
export const ProductDescriptions = {
  EmotionMatching: EmotionMatchingDescription,
  EmotionalJournal: EmotionalJournalDescription,
  EmotionalNFTs: EmotionalNFTsDescription,
  AdvancedAnalytics: AdvancedAnalyticsDescription,
  EmotionalImprints: EmotionalImprintsDescription,
  AIVideoEditor: AIVideoEditorDescription,
  FamilyPlan: FamilyPlanDescription,
  TokenRewards: TokenRewardsDescription,
  VerifiedBadge: VerifiedBadgeDescription,
  PrivateChats: PrivateChatsDescription,
  AdSpace: AdSpaceDescription,
  MoodGames: MoodGamesDescription,
  CustomThemes: CustomThemesDescription,
  MoodBackgrounds: MoodBackgroundsDescription,
  TokenMilestones: TokenMilestonesDescription,
  SocialSharing: SocialSharingDescription,
  HealthServices: HealthServicesDescription,
  AdvancedEmoji: AdvancedEmojiDescription,
  ClassicalMusic: ClassicalMusicDescription
};