import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="mb-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <CardDescription>
            Last updated: May 05, 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync ("us", "we", or "our") is a brand of MoodLync Rollover Australia Inc. We are committed to protecting your privacy and ensuring your data is handled responsibly.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our MoodLync application and services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">About MoodLync</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync is an emotion-driven social networking platform designed to create authentic human connections based on shared emotional experiences.
            </p>

            <h3 className="text-lg font-medium mb-2">Our Logo and Brand</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The MoodLync logo features a stylized "MOOD·LYNC" text with a separator dot in a purple theme that represents the balance between emotional states and connection. MoodLync is an individual brand of MoodLync Rollover Australia Inc.
            </p>
            
            <div className="rounded-lg border p-4 my-4 bg-gray-50 dark:bg-gray-900">
              <h4 className="font-medium mb-2">Our Brand Colors and Their Meaning</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                The colors we use throughout our application are carefully chosen to support our user's emotional journey:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#0094FF' }}></div>
                  <div>
                    <p className="font-medium text-sm">#0094FF (Vivid Azure Blue)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Psychology: Trust, clarity, communication — providing a sense of security when sharing emotional data.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#BF0000' }}></div>
                  <div>
                    <p className="font-medium text-sm">#BF0000 (Deep Carmine Red)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Psychology: Urgency, passion, alerts — used selectively for important privacy notifications.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#23953C' }}></div>
                  <div>
                    <p className="font-medium text-sm">#23953C (Lush Green)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Psychology: Growth, harmony, nature — signifying the natural progression of emotional wellness.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#FF4D6D' }}></div>
                  <div>
                    <p className="font-medium text-sm">#FF4D6D (Warm Coral-Pink)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Psychology: Energy, warmth, approachable urgency — creating a welcoming environment for emotional sharing.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#5933E0' }}></div>
                  <div>
                    <p className="font-medium text-sm">#5933E0 (Electric Purple)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Psychology: Creativity, luxury, futurism — our primary brand color representing our innovative approach to emotional wellness and connection.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#525252' }}></div>
                  <div>
                    <p className="font-medium text-sm">#525252 (Mid Gray)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Psychology: Neutrality, balance, professionalism — used for interface elements where emotional neutrality is required.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We may collect several types of information from and about users of our Application, including:
            </p>

            <h3 className="text-lg font-medium mb-2">1.1. Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Contact information (email address, name, username)</li>
              <li>Account credentials</li>
              <li>Profile information (gender, location, profile picture)</li>
              <li>Payment information (for premium subscriptions)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">1.2. Emotional Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Self-reported emotional states</li>
              <li>Optional AI-analyzed facial expressions (when enabled)</li>
              <li>Journal entries and text sentiment analysis</li>
              <li>Emotional pattern data over time</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">1.3. Activity Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Usage patterns and engagement metrics</li>
              <li>Chat room and messaging activity</li>
              <li>Connection data with other users</li>
              <li>Token earning and redemption history</li>
              <li>Features used and time spent</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">1.4. Technical Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Device information (type, operating system, browser)</li>
              <li>IP address and general location</li>
              <li>Log data and usage statistics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The information we collect is used for various purposes, including:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Providing, maintaining, and improving our Application</li>
              <li>Matching users based on emotional states</li>
              <li>Facilitating connections in mood-based chat rooms</li>
              <li>Generating personalized insights about your emotional patterns</li>
              <li>Managing your account and preferences</li>
              <li>Processing subscriptions and token transactions</li>
              <li>Creating and awarding NFTs for emotional milestones (Premium feature)</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Sending service updates and administrative messages</li>
              <li>For research and analytics to improve our services</li>
              <li>Detecting and preventing fraudulent or unauthorized activity</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Protect Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information, including:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>End-to-end encryption for all chat communications</li>
              <li>Secure storage of emotional data with strict access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Zero-knowledge proofs for sensitive NFT data (ensuring no personal data is exposed in blockchain transactions)</li>
              <li>Compliance with industry-standard security protocols</li>
              <li>Staff training on privacy and security best practices</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Sharing Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may share certain aspects of your information with:
            </p>

            <h3 className="text-lg font-medium mb-2">4.1. Other Users</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Information you choose to share in your public profile</li>
              <li>Your current emotional state (when you opt to share it)</li>
              <li>Content you post in chat rooms or public areas</li>
              <li>Family members in Family Plans (with explicit consent)</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">4.2. Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Payment processors (for subscription and token transactions)</li>
              <li>Cloud storage providers</li>
              <li>Analytics and data processing partners</li>
              <li>Customer support services</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">4.3. Legal Requirements</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>In response to lawful requests by public authorities</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            
            <p className="text-gray-700 dark:text-gray-300 mt-4 font-medium">
              We DO NOT sell your emotional data or personal information to advertisers or third parties.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Privacy Controls</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We are committed to providing you with control over your data:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Account Settings:</strong> You can update or correct your personal information through your account settings</li>
              <li><strong>Emotional Data Controls:</strong> Choose whether to use AI emotion detection or rely solely on manual input</li>
              <li><strong>Privacy Dashboard:</strong> View and manage all data collected about you</li>
              <li><strong>Consent Management:</strong> Adjust who can see your emotional state and updates</li>
              <li><strong>Family Plan Controls:</strong> Specifically consent to emotion tracking by family members</li>
              <li><strong>Data Download:</strong> Request a copy of your personal data</li>
              <li><strong>Data Deletion:</strong> Request deletion of your account and associated data</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Service is not directed to anyone under the age of 16 ("Children").
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We do not knowingly collect personally identifiable information from anyone under 16 years of age. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We will retain your personal information and emotional data only for as long as is necessary for the purposes set out in this Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              When you delete your account, we will remove your personal information and individual emotional data within 14 days. However, we may retain anonymized, aggregated data for research and improvement purposes.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">8. International Data Transfers</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. If you are located outside Australia and choose to provide information to us, please note that we transfer the information, including Personal Data, to Australia and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">9. NFT Data and Blockchain Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For Premium users, our NFT feature represents emotional milestones as digital tokens. Our approach to blockchain privacy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>We use zero-knowledge proofs to verify achievements without exposing personal data</li>
              <li>Emotion NFTs are soulbound (non-transferable) and linked only to your MoodLync account</li>
              <li>Only achievement metadata is stored on the blockchain, not your personal or emotional data</li>
              <li>Your identity is never linked to blockchain addresses in any public way</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please contact us at privacy@moodlync.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}