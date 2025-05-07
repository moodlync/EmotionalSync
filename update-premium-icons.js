import fs from 'fs';

// Read the file content
const welcomePagePath = './client/src/pages/welcome-page.tsx';
let welcomePageContent = fs.readFileSync(welcomePagePath, 'utf8');

// Define the icons to replace
const iconsToReplace = [
  // Premium showcase section icons with larger images
  {
    name: 'emotion-matching-showcase',
    oldPattern: /src="\/assets\/premium-features\/emotion-matching\.jpg"\s+alt="Emotion Matching"\s+className="w-full h-full object-cover object-center/g,
    newValue: 'src="/assets/premium-features/emotion-matching.jpg" alt="Emotion Matching" className="w-full h-full object-cover object-center'
  },
  // Mini feature icons for compact cards
  { 
    name: 'verified-badge', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?verified-badge\.jpg"\s+alt="Verified Badge"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/verified-badge.svg" alt="Verified Badge" className="w-full h-full object-contain"'
  },
  { 
    name: 'private-chats', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?private-chats\.jpg"\s+alt="Private Chats"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/private-chats.svg" alt="Private Chats" className="w-full h-full object-contain"'
  },
  { 
    name: 'ad-space', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?ad-space\.jpg"\s+alt="Ad Space"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/ad-space.svg" alt="Ad Space" className="w-full h-full object-contain"'
  },
  { 
    name: 'family-plan', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?family-plan(?:-access)?\.jpg"\s+alt="Family Plan"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/family-plan.svg" alt="Family Plan" className="w-full h-full object-contain"'
  },
  { 
    name: 'mood-backgrounds', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?mood-backgrounds\.jpg"\s+alt="Mood Backgrounds"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/mood-backgrounds.svg" alt="Mood Backgrounds" className="w-full h-full object-contain"'
  },
  { 
    name: 'token-milestones', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?token-milestones\.jpg"\s+alt="Token Milestones"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/token-milestones.svg" alt="Token Milestones" className="w-full h-full object-contain"'
  },
  { 
    name: 'social-sharing', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?social-sharing\.jpg"\s+alt="Social Sharing"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/social-sharing.svg" alt="Social Sharing" className="w-full h-full object-contain"'
  },
  { 
    name: 'mood-games', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?mood-games\.jpg"\s+alt="Mood Games"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/mood-games.svg" alt="Mood Games" className="w-full h-full object-contain"'
  },
  { 
    name: 'custom-themes', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?custom-themes\.jpg"\s+alt="Custom Themes"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/custom-themes.svg" alt="Custom Themes" className="w-full h-full object-contain"'
  },
  { 
    name: 'emotional-nfts', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?emotional-nfts\.jpg"\s+alt="Emotional NFTs"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/emotional-nfts.svg" alt="Emotional NFTs" className="w-full h-full object-contain"'
  },
  { 
    name: 'health-services', 
    oldPattern: /src="\/assets\/premium-features\/(?:custom\/)?health-services(?:-marketplace)?\.jpg"\s+alt="Health Services"\s+className="w-full h-full object-cover"/g,
    newValue: 'src="/assets/icons/premium-features/health-services.svg" alt="Health Services" className="w-full h-full object-contain"'
  }
];

// Replace each icon
iconsToReplace.forEach(icon => {
  welcomePageContent = welcomePageContent.replace(icon.oldPattern, icon.newValue);
  console.log(`Replacing ${icon.name} icon`);
});

// Write the updated content back to the file
fs.writeFileSync(welcomePagePath, welcomePageContent);
console.log('All premium icons updated successfully!');