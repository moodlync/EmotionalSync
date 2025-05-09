import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PrivacyPolicyProps {
  companyName: string;
  lastUpdated: string;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ 
  companyName = 'MoodLync',
  lastUpdated = new Date().toLocaleDateString()
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">{companyName} Privacy Policy</CardTitle>
        <CardDescription>Last Updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="data-collected">
            <AccordionTrigger className="text-lg font-semibold">Data Collected</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Personal Information</h4>
                <p>We collect the following personal information:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Email address</li>
                  <li>Username and password</li>
                  <li>Optional: First and last name</li>
                  <li>Optional: Profile image</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Mood and Emotion Data</h4>
                <p>We collect the following emotion-related data:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Mood logs (selected emotions and timestamps)</li>
                  <li>Journal entries (encrypted on our servers)</li>
                  <li>Emotion patterns and trends (derived from your mood logs)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Usage Information</h4>
                <p>We collect information about how you use our services:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Login times and session durations</li>
                  <li>Features used within the application</li>
                  <li>Device information (type, operating system, browser)</li>
                  <li>IP address and approximate location (country/region level only)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="purpose">
            <AccordionTrigger className="text-lg font-semibold">Purpose of Data Collection</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Primary Purposes</h4>
                <ul className="list-disc pl-6 mt-2">
                  <li>Provide emotional tracking and analysis services</li>
                  <li>Enable emotion-based connections with other users</li>
                  <li>Generate personalized insights about your emotional patterns</li>
                  <li>Secure your account and personal information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Secondary Purposes (with opt-in consent)</h4>
                <ul className="list-disc pl-6 mt-2">
                  <li>Improve our services through anonymized data analytics</li>
                  <li>Research on emotional well-being (anonymized data only)</li>
                  <li>Personalize your experience with relevant features</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="rights">
            <AccordionTrigger className="text-lg font-semibold">Your Rights</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>You have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Access:</strong> You can access your personal data at any time through the Privacy Dashboard in your account settings.</li>
                <li><strong>Correction:</strong> You can update or correct your personal information through your account settings.</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and associated data through the Privacy Dashboard.</li>
                <li><strong>Data Export:</strong> You can export all your data in a machine-readable format through the Privacy Dashboard.</li>
                <li><strong>Restriction:</strong> You can limit how we use your data through privacy controls in your account settings.</li>
                <li><strong>Objection:</strong> You can opt out of certain processing activities through the Privacy Dashboard.</li>
              </ul>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">California Residents (CCPA)</h4>
                <p>California residents have the right to:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Know what personal information is collected</li>
                  <li>Know if personal information is sold or shared</li>
                  <li>Opt out of the sale of personal information</li>
                  <li>Request deletion of personal information</li>
                  <li>Not be discriminated against for exercising privacy rights</li>
                </ul>
                <p className="mt-2">You can exercise these rights through the Privacy Dashboard or by contacting us at privacy@{companyName.toLowerCase()}.com</p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="security">
            <AccordionTrigger className="text-lg font-semibold">Security Measures</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>We employ the following security measures to protect your data:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Encryption:</strong> All sensitive data is encrypted using AES-256 encryption both in transit and at rest.</li>
                <li><strong>End-to-End Encryption:</strong> Journal entries and sensitive emotional data are end-to-end encrypted.</li>
                <li><strong>Authentication:</strong> Multi-factor authentication (MFA) is available for all accounts.</li>
                <li><strong>Access Controls:</strong> Strict access controls limit which employees can access user data.</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</li>
                <li><strong>Data Backups:</strong> Encrypted backups are maintained to prevent data loss.</li>
              </ul>
              
              <p className="mt-4">In the event of a data breach that may affect your personal information, we will notify you within 72 hours of discovery in accordance with applicable law.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="third-parties">
            <AccordionTrigger className="text-lg font-semibold">Third Party Sharing</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>We may share data with the following third parties:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Cloud Infrastructure:</strong> AWS (hosting provider)</li>
                <li><strong>Authentication Services:</strong> Firebase Authentication</li>
                <li><strong>Analytics:</strong> Anonymized usage data with analytics providers (if you opt-in)</li>
              </ul>
              
              <p className="mt-4">All third parties are contractually obligated to use your data only for the purposes of providing their services to us and must comply with our privacy and security requirements.</p>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">We DO NOT:</h4>
                <ul className="list-disc pl-6 mt-2">
                  <li>Sell your personal data to third parties</li>
                  <li>Share your emotional data with advertisers</li>
                  <li>Allow third parties to track you across websites for advertising purposes</li>
                </ul>
              </div>
              
              <p className="mt-4">Data Processing Agreements (DPAs) are in place with all service providers who process personal data on our behalf. These agreements are available upon request.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="retention">
            <AccordionTrigger className="text-lg font-semibold">Data Retention</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>We retain your personal data for as long as you maintain an account with us, plus the following periods for specific data types:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Account Information:</strong> Retained for 30 days after account deletion to allow for recovery</li>
                <li><strong>Emotional Data and Journal Entries:</strong> Immediately deleted upon account deletion</li>
                <li><strong>Login Records:</strong> Retained for 90 days for security purposes</li>
                <li><strong>Analytics Data:</strong> Anonymized after 12 months</li>
              </ul>
              
              <p className="mt-4">You can request immediate deletion of all your data at any time through the Privacy Dashboard in your account settings.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="contact">
            <AccordionTrigger className="text-lg font-semibold">Contact Information</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>If you have any questions or concerns about this privacy policy or our data practices, please contact us:</p>
              <ul className="list-none pl-6 mt-2">
                <li><strong>Email:</strong> privacy@{companyName.toLowerCase()}.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@{companyName.toLowerCase()}.com</li>
                <li><strong>Postal Address:</strong> {companyName} Privacy Team, 123 Emotion Street, San Francisco, CA 94103, USA</li>
              </ul>
              
              <p className="mt-4">We will respond to all inquiries within 30 days.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="changes">
            <AccordionTrigger className="text-lg font-semibold">Changes to This Policy</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>We may update this privacy policy from time to time. When we make significant changes, we will:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Notify you via email (if we have your email address)</li>
                <li>Display a prominent notice within the application</li>
                <li>Update the "Last Updated" date at the top of this policy</li>
              </ul>
              
              <p className="mt-4">Your continued use of our services after such changes constitutes your acceptance of the updated policy.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PrivacyPolicy;