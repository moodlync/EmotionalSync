import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CookiePolicyProps {
  companyName: string;
  lastUpdated: string;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ 
  companyName = 'MoodLync',
  lastUpdated = new Date().toLocaleDateString()
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">{companyName} Cookie Policy</CardTitle>
        <CardDescription>Last Updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="about">
            <AccordionTrigger className="text-lg font-semibold">About This Cookie Policy</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                This Cookie Policy explains how {companyName} ("we", "us", or "our") uses cookies and similar tracking technologies when you visit our website at www.{companyName.toLowerCase()}.com or use our mobile application (collectively, our "Service").
              </p>
              <p>
                This policy explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
              <p>
                By continuing to use our Service, you consent to our use of cookies and similar technologies in accordance with this Cookie Policy.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="what-are-cookies">
            <AccordionTrigger className="text-lg font-semibold">What Are Cookies?</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              <p>
                Cookies allow a website to recognize your device and remember if you've been to the website before. They are used for various purposes, such as helping you navigate between pages efficiently, remembering your preferences, and generally improving your user experience.
              </p>
              <p>
                Cookies can be "first-party cookies" (set by us) or "third-party cookies" (set by a third party, such as our analytics or advertising partners). They can also be "session cookies" (which expire when you close your browser) or "persistent cookies" (which remain on your device for a set period of time).
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="similar-technologies">
            <AccordionTrigger className="text-lg font-semibold">Similar Technologies</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                In addition to cookies, we may use other similar technologies on our Service, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  <strong>Web beacons (or "clear gifs"):</strong> Small graphic images that allow us to monitor the use of our Service. They help us understand how users engage with our emails and webpages.
                </li>
                <li>
                  <strong>Local storage:</strong> Similar to cookies, but with greater capacity and generally stored on your browser rather than on our server. This allows us to store larger amounts of information locally on your device.
                </li>
                <li>
                  <strong>Device fingerprinting:</strong> The process of collecting and analyzing information about your device, such as your browser type and version, operating system, screen resolution, and language preferences, to create a unique profile for your device.
                </li>
                <li>
                  <strong>Pixels:</strong> Small images embedded in webpages and emails that allow us to collect information about your engagement with our content.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="categories">
            <AccordionTrigger className="text-lg font-semibold">Categories of Cookies We Use</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                We use the following categories of cookies:
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Essential Cookies</h4>
                  <p>
                    These cookies are necessary for the Service to function properly and cannot be switched off. They are usually only set in response to actions made by you, such as logging in, setting your privacy preferences, or filling in forms.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance Cookies</h4>
                  <p>
                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Service. They help us understand which pages are the most and least popular and see how visitors move around the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Functionality Cookies</h4>
                  <p>
                    These cookies enable the Service to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Targeting Cookies</h4>
                  <p>
                    These cookies may be set through our Service by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other websites.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Social Media Cookies</h4>
                  <p>
                    These cookies are set by social media services that we have added to the Service to enable you to share our content with your friends and networks. They can track your browser across other sites and build a profile of your interests.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="specific-cookies">
            <AccordionTrigger className="text-lg font-semibold">Specific Cookies We Use</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                Below is a detailed list of the cookies we use on our Service:
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>mlync_session</TableCell>
                    <TableCell>{companyName}</TableCell>
                    <TableCell>Maintains your session state across page requests</TableCell>
                    <TableCell>Session</TableCell>
                    <TableCell>Essential</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>mlync_auth</TableCell>
                    <TableCell>{companyName}</TableCell>
                    <TableCell>Remembers that you are logged in</TableCell>
                    <TableCell>1 year</TableCell>
                    <TableCell>Essential</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>mlync_preferences</TableCell>
                    <TableCell>{companyName}</TableCell>
                    <TableCell>Stores your preferences (dark/light mode, notification settings)</TableCell>
                    <TableCell>1 year</TableCell>
                    <TableCell>Functionality</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>mlync_utm</TableCell>
                    <TableCell>{companyName}</TableCell>
                    <TableCell>Tracks referral sources and campaign attribution</TableCell>
                    <TableCell>30 days</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>_ga</TableCell>
                    <TableCell>Google Analytics</TableCell>
                    <TableCell>Used to distinguish users for analytics purposes</TableCell>
                    <TableCell>2 years</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>_gid</TableCell>
                    <TableCell>Google Analytics</TableCell>
                    <TableCell>Used to distinguish users for analytics purposes</TableCell>
                    <TableCell>24 hours</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="purposes">
            <AccordionTrigger className="text-lg font-semibold">Purposes of Processing</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                We use cookies and similar technologies for the following purposes:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>To enable you to use our Service and access secure areas</li>
                <li>To recognize you when you return to our Service</li>
                <li>To remember your preferences and settings</li>
                <li>To improve our Service and user experience</li>
                <li>To analyze how our Service is used and measure the effectiveness of our content</li>
                <li>To personalize content based on your preferences and past behavior</li>
                <li>To remember information you've entered, such as items in your shopping cart or form data</li>
                <li>To protect against fraudulent activity and improve security</li>
                <li>To provide social media features and analyze sharing</li>
                <li>To serve relevant advertisements to you on and off our Service (with your consent where required)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="third-parties">
            <AccordionTrigger className="text-lg font-semibold">Third-Party Cookies</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                Some cookies are placed by third parties on our Service. These third parties may include:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Analytics providers (such as Google Analytics)</li>
                <li>Advertising and marketing partners</li>
                <li>Social media platforms (when you use social sharing buttons or log in using social media accounts)</li>
                <li>Customer support service providers</li>
                <li>Security and fraud prevention providers</li>
              </ul>
              <p className="mt-4">
                These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our Service and other websites. This information may be used to provide analytical services, target advertising, and enable social media functionality.
              </p>
              <p className="mt-2">
                We do not control third-party cookies. You can opt out of third-party cookies through your browser settings or the privacy settings provided by these third parties.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="control">
            <AccordionTrigger className="text-lg font-semibold">Your Cookie Choices</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Browser Settings</h4>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. You can set your browser to reject or block cookies, or to alert you when a cookie is being set.
                </p>
                <p className="mt-2">
                  Please note that if you choose to block all cookies, you may not be able to access all or parts of our Service, or some features may not function properly.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Our Cookie Consent Tool</h4>
                <p>
                  When you first visit our Service, you will be presented with a cookie banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time by clicking on the "Cookie Settings" link in the footer of our Service.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Opt-Out of Specific Third-Party Cookies</h4>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Google Analytics:</strong> You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics Opt-out Browser Add-on</a>.
                  </li>
                  <li>
                    <strong>Advertising Networks:</strong> You can opt out of interest-based advertising through the <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Digital Advertising Alliance</a>, the <a href="http://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Network Advertising Initiative</a>, or <a href="http://youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Your Online Choices</a>.
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Do Not Track</h4>
                <p>
                  Some browsers have a "Do Not Track" feature that signals to websites that you visit that you do not want to have your online activity tracked. Due to the lack of a common industry standard for Do Not Track signals, our Service does not currently respond to Do Not Track signals from browsers.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="mobile">
            <AccordionTrigger className="text-lg font-semibold">Mobile Device Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                If you access our Service through a mobile device, you can control tracking technologies through your device settings, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <strong>iOS devices:</strong> Settings &gt; Privacy &gt; Tracking, and toggle "Allow Apps to Request to Track" to off. You can also limit ad tracking by going to Settings &gt; Privacy &gt; Advertising and toggling on "Limit Ad Tracking."
                </li>
                <li>
                  <strong>Android devices:</strong> Settings &gt; Google &gt; Ads &gt; Opt out of Ads Personalization.
                </li>
              </ul>
              <p className="mt-2">
                Mobile applications may also use mobile analytics software to allow us to better understand the functionality of our mobile software on your device. This software may record information such as how often you use the application, the events that occur within the application, aggregated usage, performance data, and where the application was downloaded from.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="updates">
            <AccordionTrigger className="text-lg font-semibold">Updates to This Cookie Policy</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The date at the top of this policy indicates when it was last updated.
              </p>
              <p className="mt-2">
                When we make significant changes to this policy, we will notify you by displaying a prominent notice on our Service or by sending you an email notification, where appropriate.
              </p>
              <p className="mt-2">
                We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies and related technologies.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="contact">
            <AccordionTrigger className="text-lg font-semibold">Contact Us</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                If you have any questions or concerns about our use of cookies or this Cookie Policy, please contact us at:
              </p>
              <ul className="list-none pl-6 mt-2">
                <li><strong>Email:</strong> privacy@{companyName.toLowerCase()}.com</li>
                <li><strong>Postal Address:</strong> {companyName} Privacy Team, 123 Emotion Street, San Francisco, CA 94103, USA</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CookiePolicy;