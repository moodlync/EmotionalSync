import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsConditionsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="mb-8">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
          <CardDescription>
            Last updated: May 05, 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Welcome to MoodLync</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync is a brand of MoodLync Rollover Australia Inc. These Terms and Conditions govern your use of the MoodLync application 
              (the "Service") and constitute a binding legal agreement between you and MoodLync Rollover Australia Inc.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">1. About MoodLync</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync is an emotion-driven social networking platform that helps users connect based on emotional states rather than traditional social profiles. Our mission is to create authentic human connections focused on shared emotional experiences.
            </p>

            <h3 className="text-lg font-medium mb-2">Our Logo and Brand</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The MoodLync logo features a stylized "MOOD·LYNC" text with a separator dot in a purple theme that represents the balance between emotional states and connection. MoodLync is an individual brand of MoodLync Rollover Australia Inc.
            </p>
            
            <div className="rounded-lg border p-4 my-4 bg-gray-50 dark:bg-gray-900">
              <h4 className="font-medium mb-2">Our Brand Colors and Their Meaning</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#0094FF' }}></div>
                  <div>
                    <p className="font-medium text-sm">#0094FF (Vivid Azure Blue)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Represents trust, clarity, and communication — essential for honest emotional connections.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#BF0000' }}></div>
                  <div>
                    <p className="font-medium text-sm">#BF0000 (Deep Carmine Red)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Signifies urgency, passion, and alerts — used for important notifications and warnings.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#23953C' }}></div>
                  <div>
                    <p className="font-medium text-sm">#23953C (Lush Green)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Embodies growth, harmony, and nature — reflecting personal development and healing.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#FF4D6D' }}></div>
                  <div>
                    <p className="font-medium text-sm">#FF4D6D (Warm Coral-Pink)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conveys energy, warmth, and approachable urgency — used for engagement features.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#5933E0' }}></div>
                  <div>
                    <p className="font-medium text-sm">#5933E0 (Electric Purple)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Our primary brand color symbolizing creativity, luxury, and futurism — representing our innovative approach to emotional wellness.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#525252' }}></div>
                  <div>
                    <p className="font-medium text-sm">#525252 (Mid Gray)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Provides neutrality, balance, and professionalism — used for UI elements that require subtlety.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Emotional Data and Content</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync collects and processes emotional data provided by users through manual input or optional AI analysis. By using our Service, you grant MoodLync a license to use, process, and store this emotional data to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Provide and improve the Service</li>
              <li>Match you with other users based on emotional states</li>
              <li>Analyze patterns and generate insights about your emotional wellness</li>
              <li>Create aggregated, anonymized data for research and development</li>
              <li>Generate and display NFTs representing your emotional milestones (with your consent)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Token Economy and Rewards</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync operates a token-based reward system subject to the following terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Tokens have no cash value except where explicitly offered for redemption</li>
              <li>Token earning rates may be adjusted at MoodLync's discretion</li>
              <li>Token redemption requires a minimum balance and is subject to processing time</li>
              <li>Token transfers between accounts are only permitted in Family Plans</li>
              <li>MoodLync reserves the right to expire tokens with reasonable notice</li>
              <li>Abuse of the token system may result in account penalties</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Premium Subscriptions</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              MoodLync offers premium subscription plans with the following terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Subscription payments are processed securely through our payment partners</li>
              <li>Free trials automatically convert to paid subscriptions unless canceled</li>
              <li>Refunds are processed according to our Refund Policy</li>
              <li>Family Plans permit up to 5 members with mood tracking consent features</li>
              <li>Subscription features may be updated over time</li>
              <li>We may offer promotional pricing that is subject to specific terms</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">6. NFT Features</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For Premium users, MoodLync offers NFT (Non-Fungible Token) features that represent emotional milestones:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>NFTs are digital tokens bound to your MoodLync account and cannot be traded or sold</li>
              <li>NFTs may be earned through platform engagement or emotional milestones</li>
              <li>NFT ownership provides certain benefits within the MoodLync platform only</li>
              <li>MoodLync makes no guarantees regarding the future value of NFTs</li>
              <li>NFT features may not be available in all jurisdictions</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Prohibited Uses</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, abuse, or harm another person or group</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Collect or track personal information of other users</li>
              <li>Engage in any activity that could harm the emotional wellbeing of others</li>
              <li>Attempt to manipulate the token or reward system</li>
              <li>Share explicit, harmful, or inappropriate content</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Service and its original content, features, and functionality are owned by MoodLync Rollover Australia Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              The MoodLync name, logo, and brand elements are trademarks of MoodLync Rollover Australia Inc. You agree not to use these without the prior written consent of MoodLync.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              In no event shall MoodLync Rollover Australia Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any emotional responses or mental health impacts related to using the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use or alteration of your transmissions or content</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 14 days' notice prior to any new terms taking effect.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms, please contact us at legal@moodlync.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}