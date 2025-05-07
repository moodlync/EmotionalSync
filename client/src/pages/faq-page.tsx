import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout';
import { Search, Zap, Brain, Shield, Settings, Sparkles, Users, Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('core');

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find answers to common questions about MoodLync's features and capabilities
            </p>
          </div>

          <div className="mb-8">
            <Tabs 
              defaultValue="core" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1">
                  <TabsTrigger value="core" className="flex items-center gap-1.5">
                    <Brain className="h-4 w-4" />
                    <span className="hidden md:inline">Core Features</span>
                    <span className="inline md:hidden">Core</span>
                  </TabsTrigger>
                  <TabsTrigger value="tokens" className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4" />
                    <span className="hidden md:inline">Token Economy</span>
                    <span className="inline md:hidden">Tokens</span>
                  </TabsTrigger>
                  <TabsTrigger value="premium" className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden md:inline">Premium Features</span>
                    <span className="inline md:hidden">Premium</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    <span className="hidden md:inline">Privacy & Safety</span>
                    <span className="inline md:hidden">Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="flex items-center gap-1.5">
                    <Settings className="h-4 w-4" />
                    <span className="hidden md:inline">Technical Issues</span>
                    <span className="inline md:hidden">Technical</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="core" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Core Functionality
                    </CardTitle>
                    <CardDescription>
                      Learn how MoodLync helps you track and share your emotions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          How does MoodLync detect my mood?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">MoodLync uses a multi-layered approach for accuracy and flexibility:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Manual Input:</strong> Slide emoji scales (😢→😊) or pick from 50+ nuanced moods (e.g., "Anxious but hopeful").</li>
                            <li><strong>AI Detection (Optional):</strong> Enable camera to analyze facial expressions via Affectiva's emotion recognition API (e.g., raised eyebrows = surprise).</li>
                            <li><strong>Text Analysis:</strong> Journals scan for keywords + sentiment (e.g., "overwhelmed" flags stress).</li>
                          </ul>
                          <div className="mt-3 p-3 bg-primary/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Unlike apps that only use AI (which can misread), MoodLync combines tech with human self-awareness.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          Can I use MoodLync anonymously?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Absolutely. Here's how we protect privacy:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>No Real Names:</strong> Sign up with a pseudonym (e.g., "SunnySide22").</li>
                            <li><strong>Incognito Mode:</strong> Disable face detection and location sharing.</li>
                            <li><strong>Data Control:</strong> Delete mood logs anytime—we don't store them permanently.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-primary/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Competitors like Facebook require real identities; MoodLync prioritizes emotional honesty without exposure.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          How do mood-based chat rooms work?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">A dynamic system to match emotional needs:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Auto-Suggested Rooms:</strong> Join "#GratefulToday" if you log "happy" or "#NeedAHug" if you're "lonely."</li>
                            <li>
                              <strong>Support/Mirror Toggle:</strong>
                              <ul className="list-disc pl-5 mt-1">
                                <li><em>Support Mode:</em> Connect with opposite moods (e.g., calm users comfort anxious ones).</li>
                                <li><em>Mirror Mode:</em> Bond with similar moods (e.g., excited users hype each other up).</li>
                              </ul>
                            </li>
                            <li><strong>Safety Features:</strong> Rooms are moderated; users can report toxicity.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-primary/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Unlike Discord's interest-based chats, MoodLync rooms are emotionally intentional.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tokens" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Coins className="h-5 w-5 text-amber-500" />
                      Token Economy & Rewards
                    </CardTitle>
                    <CardDescription>
                      Understand how to earn and use tokens in MoodLync
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          How do I earn tokens?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Tokens reward consistent self-care, not just engagement:</p>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse my-3">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                  <th className="border p-2 text-left">Activity</th>
                                  <th className="border p-2 text-left">Tokens</th>
                                  <th className="border p-2 text-left">Cap</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border p-2">Daily Login</td>
                                  <td className="border p-2">+5</td>
                                  <td className="border p-2">35/week</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Journal Entry (50+ words)</td>
                                  <td className="border p-2">+10</td>
                                  <td className="border p-2">70/week</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Sharing a Milestone</td>
                                  <td className="border p-2">+15</td>
                                  <td className="border p-2">30/week</td>
                                </tr>
                                <tr>
                                  <td className="border p-2">Referring a Friend</td>
                                  <td className="border p-2">+20</td>
                                  <td className="border p-2">100 lifetime</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-2 p-3 bg-amber-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Apps like Duolingo reward streaks alone; MoodLync incentivizes depth (e.g., journaling instead of mindless scrolling).
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          What can I redeem tokens for?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Real-world value, not just digital fluff:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Premium Access:</strong> 1-day pass (50 tokens), 1-week pass (300 tokens).</li>
                            <li><strong>Charity Donations:</strong> 1000 tokens = $1 donated to mental health organizations.</li>
                            <li><strong>NFT Minting:</strong> Create unique Emotional NFTs that evolve as you grow.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-amber-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> MoodLync tokens have real-world impact beyond the app.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          Why decrease token rewards by 75%?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">To combat exploitative design:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Old System:</strong> Users earned 100 tokens/day by spamming low-effort journals.</li>
                            <li><strong>New System:</strong> Focus on quality—e.g., a thoughtful 7-day journal streak now earns a 50-token bonus.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-amber-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> We prioritize mental health over addictive hooks.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="premium" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      Premium Features
                    </CardTitle>
                    <CardDescription>
                      Discover the exclusive features available with premium subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          Is the family plan worth it?
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Mood Insights:</strong> Spot patterns (e.g., "Teen's anxiety spikes on school nights").</li>
                            <li><strong>Token Pooling:</strong> Parents can gift tokens to reward kids for healthy habits.</li>
                            <li><strong>Emergency Alerts:</strong> Notify trusted members if severe moods (e.g., "depressed") persist.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-violet-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> No other app offers cross-generational emotional support.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          What's in the AI video editor?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Premium users get tools to visually express emotions:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Auto-Themes:</strong> AI suggests filters/music based on mood tags (e.g., "melancholic" → blue tint + piano).</li>
                            <li><strong>Captions:</strong> Generates subtitles like "This week I struggled, but grew" from journal keywords.</li>
                            <li><strong>B-Roll Library:</strong> 500+ free clips (e.g., rain for sadness, sunrises for hope).</li>
                          </ul>
                          <div className="mt-3 p-3 bg-violet-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> TikTok edits for views; MoodLync edits for self-reflection.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          How do Emotion NFTs work?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">A blockchain-powered system for emotional milestones:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Mint Your Growth:</strong> When you hit emotional milestones (e.g., "30-day gratitude streak"), mint a dynamic NFT that visually evolves as you progress.</li>
                            <li><strong>Real Rewards:</strong> NFTs can be used to unlock token bonuses or access special features.</li>
                            <li><strong>Privacy-First:</strong> Uses zero-knowledge proofs so no personal data is exposed.</li>
                            <li><strong>Non-Transferable:</strong> Soulbound NFTs can't be sold to prevent exploitation.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-violet-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Turns emotional growth into tangible, rewarding assets without speculation.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      Privacy & Safety
                    </CardTitle>
                    <CardDescription>
                      Understand how MoodLync protects your data and ensures a safe environment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          Who sees my mood data?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">You control visibility:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Private:</strong> Only you (default for journals).</li>
                            <li><strong>Shared:</strong> With consent (e.g., family plan or therapist).</li>
                            <li><strong>Public:</strong> Aggregated heatmaps (no personal IDs).</li>
                          </ul>
                          <div className="mt-3 p-3 bg-green-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Unlike apps that sell data, MoodLync is ad-free and HIPAA-compliant.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          How do you moderate harmful content?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">A 3-layer system:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>AI Filters:</strong> Flag keywords (e.g., self-harm) → auto-hide + suggest resources.</li>
                            <li><strong>Human Moderators:</strong> Review reports within 24 hours.</li>
                            <li><strong>User Controls:</strong> Block/mute + restrict DMs to "friends only."</li>
                          </ul>
                          <div className="mt-3 p-3 bg-green-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Proactive care (e.g., Crisis Text Line integration) vs. reactive reporting.
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      Technical Issues
                    </CardTitle>
                    <CardDescription>
                      Solutions for common technical questions and problems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          Why no Spotify integration for music?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Two reasons:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Cost:</strong> Licensing fees would force ads/subscriptions.</li>
                            <li><strong>Focus:</strong> Our royalty-free classical/lo-fi playlists are curated for mental states (e.g., "Focus Flow" for ADHD).</li>
                          </ul>
                          <div className="mt-3 p-3 bg-blue-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> No disruptive ads or paywalls—just pure mood-matched music.
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          Can I use MoodLync offline?
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">Yes! Key offline features:</p>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Journaling:</strong> Write entries; syncs when back online.</li>
                            <li><strong>Mood Tracking:</strong> Log emotions; updates your timeline later.</li>
                            <li><strong>Meditation:</strong> Download audio guides in advance.</li>
                          </ul>
                          <div className="mt-3 p-3 bg-blue-500/10 rounded-md">
                            <strong>Why It Stands Out:</strong> Critical for users with spotty internet (e.g., rural areas, travelers).
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-10 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Join MoodLync?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Personalized Emotional Growth
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• AI-powered insights that provide actionable reports on your emotional patterns</li>
                  <li>• Earn unique NFT milestones like "90-Day Resilience Badge" that visually track your progress</li>
                  <li>• Journal rewards system converts consistent entries into therapy discounts or charity donations</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Authentic Social Connection
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• No small talk - join mood-matched rooms like #GratefulToday or #NeedSupport</li>
                  <li>• Family wellness features allow consent-based mood tracking for loved ones</li>
                  <li>• Connect with others who truly understand your current emotional state</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                  <Coins className="h-5 w-5 mr-2" />
                  Real-World Value
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Convert emotional growth streaks into real perks and benefits</li>
                  <li>• Use your emotional NFTs to plant trees or fund mental health nonprofits</li>
                  <li>• Export privacy-safe analytics to demonstrate emotional resilience training</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy-First Design
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Pseudonymous profiles with no real name required</li>
                  <li>• Auto-delete old logs or share selectively with healthcare providers</li>
                  <li>• Premium-funded model means your emotional data is never sold to advertisers</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gamified Wellness
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Dynamic NFTs that evolve as your meditation hours or journal entries accumulate</li>
                  <li>• Join global challenges with community gratitude streaks to unlock VIP features</li>
                  <li>• Turn emotional growth into a rewarding journey with visual milestones</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Mental Health Safeguards
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• AI detection for severe moods with crisis tools available when needed</li>
                  <li>• Addiction-resistant design with no endless scrolling</li>
                  <li>• Quality engagement rewards instead of mindless usage metrics</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-primary/20 to-secondary/20 p-5 rounded-lg">
              <h3 className="text-xl font-bold mb-3 text-center">What Makes MoodLync Unique</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-medium">Beyond Apps Like Headspace</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Not just self-help—it's social healing</p>
                </div>
                <div>
                  <p className="font-medium">Beyond Crypto NFTs</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tokens that improve lives, not just portfolios</p>
                </div>
                <div>
                  <p className="font-medium">Our Philosophy</p>
                  <p className="text-sm font-medium text-primary">"Grow your emotions, not just your feed"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-lg font-medium mb-4">Still have questions?</h3>
            <Button className="bg-primary text-white">Contact Support</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}