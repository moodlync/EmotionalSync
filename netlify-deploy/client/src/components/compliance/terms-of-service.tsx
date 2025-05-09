import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TermsOfServiceProps {
  companyName: string;
  lastUpdated: string;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ 
  companyName = 'MoodLync',
  lastUpdated = new Date().toLocaleDateString()
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">{companyName} Terms of Service</CardTitle>
        <CardDescription>Last Updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="introduction">
            <AccordionTrigger className="text-lg font-semibold">1. Introduction</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                Welcome to {companyName}. These Terms of Service ("Terms") govern your use of the {companyName} platform, 
                including our website, mobile applications, and any other services provided by {companyName} 
                (collectively, the "Service").
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to 
                all of these Terms, you may not use the Service.
              </p>
              <p>
                We may update these Terms from time to time. If we make material changes, we will notify you 
                through the Service or by other means, such as email. Your continued use of the Service after 
                such notice constitutes your acceptance of the updated Terms.
              </p>
              <p>
                Please read these Terms carefully, as they contain important information about your rights and 
                obligations, including limitations on our liability to you and a class action waiver.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="eligibility">
            <AccordionTrigger className="text-lg font-semibold">2. Eligibility and Account Creation</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Eligibility:</strong> You must be at least 16 years old to use the Service. If you are 
                between 16 and 18 years old, you must have permission from a parent or legal guardian to use 
                the Service.
              </p>
              <p>
                <strong>Account Creation:</strong> To access certain features of the Service, you will need to create an 
                account. You agree to provide accurate, current, and complete information during the registration 
                process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account 
                credentials and for all activities that occur under your account. You agree to notify us immediately 
                of any unauthorized use of your account.
              </p>
              <p>
                <strong>One Account Per Person:</strong> You may not create or use more than one account. You may not 
                allow others to use your account, and you may not transfer your account to anyone else.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="content">
            <AccordionTrigger className="text-lg font-semibold">3. User Content and Conduct</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>User Content:</strong> The Service allows you to store, share, and publish content, such as 
                text, images, and videos ("User Content"). You retain ownership of your User Content, but you 
                grant us a non-exclusive, royalty-free, worldwide, sublicensable, and transferable license to 
                use, reproduce, modify, distribute, and display your User Content in connection with the Service.
              </p>
              <p>
                <strong>Prohibited Content:</strong> You may not post, upload, or share User Content that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Violates any applicable law or regulation</li>
                <li>Infringes on the rights of others, including intellectual property rights</li>
                <li>Is false, misleading, defamatory, or fraudulent</li>
                <li>Is obscene, vulgar, offensive, or harmful</li>
                <li>Contains viruses, malware, or other malicious code</li>
                <li>Promotes illegal or harmful activities</li>
                <li>Harasses, threatens, or intimidates others</li>
              </ul>
              <p>
                <strong>Conduct:</strong> You agree not to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Interfere with or disrupt the Service or our servers</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Use automated methods to access or use the Service without our permission</li>
                <li>Collect or harvest data from the Service without our permission</li>
                <li>Impersonate any person or entity</li>
              </ul>
              <p>
                <strong>Monitoring and Enforcement:</strong> We have the right, but not the obligation, to monitor, 
                edit, or remove any User Content. We may terminate or suspend your access to the Service for 
                violations of these Terms, including the posting of prohibited content or engaging in prohibited conduct.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="premium">
            <AccordionTrigger className="text-lg font-semibold">4. Premium Services and Payments</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Premium Services:</strong> The Service may offer premium features or services that require 
                payment ("Premium Services"). Additional terms may apply to Premium Services, which will be 
                presented to you when you sign up for those services.
              </p>
              <p>
                <strong>Payments:</strong> When you purchase Premium Services, you agree to pay all fees and taxes 
                associated with the purchase. All payments are non-refundable unless required by law or specified 
                otherwise in these Terms or at the time of purchase.
              </p>
              <p>
                <strong>Recurring Subscriptions:</strong> Some Premium Services may be offered as recurring subscriptions. 
                By purchasing a subscription, you authorize us to charge your payment method on a recurring basis 
                until you cancel the subscription. You may cancel a subscription at any time through your account 
                settings or by contacting us.
              </p>
              <p>
                <strong>Price Changes:</strong> We may change the price of Premium Services at any time, but we will 
                provide notice to you before the price change takes effect. The price change will take effect at 
                the start of the next subscription period.
              </p>
              <p>
                <strong>Free Trials:</strong> We may offer free trials of Premium Services. When a free trial ends, 
                your paid subscription will begin automatically unless you cancel before the end of the trial period.
              </p>
              <p>
                <strong>Token Economy:</strong> The Service may include a virtual token economy. Tokens have no cash 
                value and cannot be redeemed for cash. We may modify, regulate, control, or eliminate tokens at any 
                time without any liability to you.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="nft">
            <AccordionTrigger className="text-lg font-semibold">5. Emotional NFTs</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Emotion NFTs:</strong> The Service may include emotional non-fungible tokens ("Emotion NFTs") 
                that represent emotional milestones and achievements. Emotion NFTs are digital items stored on a 
                blockchain that represent ownership of a unique digital asset.
              </p>
              <p>
                <strong>Ownership:</strong> When you acquire an Emotion NFT, you own the NFT itself, which is a digital 
                record on a blockchain. However, you do not own the underlying intellectual property rights to the 
                content associated with the NFT, such as images or animations. You have a limited, non-exclusive 
                license to use, reproduce, and display the content associated with your Emotion NFTs solely for 
                your personal, non-commercial use.
              </p>
              <p>
                <strong>Soulbound Nature:</strong> Emotion NFTs are "soulbound," meaning they cannot be transferred, 
                sold, or traded to other users or third parties. They are permanently linked to your account and 
                represent your personal emotional journey.
              </p>
              <p>
                <strong>Evolution:</strong> Some Emotion NFTs may evolve over time based on your continued use of 
                the Service and progress in your emotional wellness journey. The evolution of NFTs is determined 
                solely by our algorithms and systems, and we make no guarantees about how or when NFTs will evolve.
              </p>
              <p>
                <strong>Burning:</strong> You may have the option to "burn" (permanently destroy) your Emotion NFTs 
                in exchange for certain benefits, such as token rewards or charitable donations. Once burned, an 
                NFT cannot be recovered or restored.
              </p>
              <p>
                <strong>No Investment Value:</strong> Emotion NFTs are intended as digital representations of emotional 
                achievements and are not designed for speculation or investment. We make no promises or guarantees 
                regarding the value, rarity, or utility of Emotion NFTs, and their features may change over time.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="intellectual-property">
            <AccordionTrigger className="text-lg font-semibold">6. Intellectual Property</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Our Intellectual Property:</strong> The Service and its original content, features, and 
                functionality are owned by {companyName} and are protected by copyright, trademark, and other 
                intellectual property laws. You may not use our trademarks, logos, or other proprietary information 
                without our prior written consent.
              </p>
              <p>
                <strong>Feedback:</strong> If you provide us with feedback or suggestions about the Service, you 
                grant us the right to use that feedback without any restriction or compensation to you.
              </p>
              <p>
                <strong>Digital Millennium Copyright Act:</strong> If you believe that your copyrighted work has 
                been copied in a way that constitutes copyright infringement, please follow our Digital Millennium 
                Copyright Act ("DMCA") process, which is described in our <a href="#" className="text-primary underline">Copyright Policy</a>.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="privacy">
            <AccordionTrigger className="text-lg font-semibold">7. Privacy</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                We collect, use, and share your personal information in accordance with our <a href="#" className="text-primary underline">Privacy Policy</a>, 
                which is incorporated by reference into these Terms. By using the Service, you agree to the 
                collection, use, and sharing of your information as described in the Privacy Policy.
              </p>
              <p>
                The Service includes features that involve the collection and analysis of emotional data, such 
                as mood tracking and emotion recognition. This data is highly sensitive, and we take special 
                precautions to protect it, as described in our Privacy Policy.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="third-party">
            <AccordionTrigger className="text-lg font-semibold">8. Third-Party Services</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                The Service may contain links to third-party websites or services that are not owned or controlled 
                by {companyName}. We have no control over, and assume no responsibility for, the content, privacy 
                policies, or practices of any third-party websites or services.
              </p>
              <p>
                You acknowledge and agree that {companyName} shall not be responsible or liable, directly or 
                indirectly, for any damage or loss caused or alleged to be caused by or in connection with the 
                use of or reliance on any such content, goods, or services available on or through any such 
                websites or services.
              </p>
              <p>
                The Service may use third-party APIs and services, such as payment processors, cloud storage 
                providers, and analytics tools. Your use of these services is subject to the terms and privacy 
                policies of those third parties, and you agree to comply with those terms and policies.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="termination">
            <AccordionTrigger className="text-lg font-semibold">9. Termination</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Your Right to Terminate:</strong> You may terminate your account at any time by following 
                the instructions in the Service or by contacting us. If you terminate your account, you will not 
                receive a refund for any fees paid.
              </p>
              <p>
                <strong>Our Right to Terminate:</strong> We may terminate or suspend your account and access to the 
                Service at any time, without notice or liability, for any reason, including if you violate these 
                Terms.
              </p>
              <p>
                <strong>Effect of Termination:</strong> Upon termination, your right to use the Service will 
                immediately cease. All provisions of these Terms that by their nature should survive termination 
                shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations 
                of liability.
              </p>
              <p>
                <strong>Data After Termination:</strong> After termination, we may retain your data as necessary 
                to comply with our legal obligations, resolve disputes, and enforce our agreements. We may also 
                continue to use your User Content as permitted by these Terms. For more information about data 
                retention, please see our Privacy Policy.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="warranty">
            <AccordionTrigger className="text-lg font-semibold">10. Warranty Disclaimers</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
                PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED 
                OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT 
                AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              <p>
                WE DO NOT WARRANT OR MAKE ANY REPRESENTATIONS REGARDING THE USE OR THE RESULTS OF THE USE OF THE 
                SERVICE IN TERMS OF CORRECTNESS, ACCURACY, RELIABILITY, OR OTHERWISE.
              </p>
              <p>
                THE SERVICE IS NOT INTENDED TO BE A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR 
                TREATMENT. ALWAYS SEEK THE ADVICE OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTH PROVIDER WITH ANY 
                QUESTIONS YOU MAY HAVE REGARDING A MEDICAL CONDITION. NEVER DISREGARD PROFESSIONAL MEDICAL ADVICE 
                OR DELAY IN SEEKING IT BECAUSE OF SOMETHING YOU HAVE READ OR HEARD ON THE SERVICE.
              </p>
              <p>
                THE SERVICE IS NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE OR HEALTH CONDITION. 
                THE USE OF THE SERVICE DOES NOT CREATE A PHYSICIAN-PATIENT RELATIONSHIP BETWEEN YOU AND {companyName}.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="liability">
            <AccordionTrigger className="text-lg font-semibold">11. Limitation of Liability</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL {companyName.toUpperCase()}, ITS AFFILIATES, 
                DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING, BUT NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, 
                GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES (EVEN IF {companyName.toUpperCase()} HAS BEEN ADVISED OF 
                THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>THE USE OR THE INABILITY TO USE THE SERVICE</li>
                <li>UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA</li>
                <li>STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SERVICE</li>
                <li>ANY OTHER MATTER RELATING TO THE SERVICE</li>
              </ul>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED 
                THE AMOUNT YOU HAVE PAID TO {companyName.toUpperCase()} IN THE PAST SIX MONTHS, OR, IF GREATER, ONE HUNDRED 
                DOLLARS ($100).
              </p>
              <p>
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION 
                OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS 
                MAY NOT APPLY TO YOU.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="indemnity">
            <AccordionTrigger className="text-lg font-semibold">12. Indemnification</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                You agree to defend, indemnify, and hold harmless {companyName}, its affiliates, directors, 
                employees, agents, and licensors from and against any claims, liabilities, damages, judgments, 
                awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of 
                or relating to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your use of the Service</li>
                <li>Your User Content</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another person or entity</li>
              </ul>
              <p>
                This indemnification obligation will survive the termination of these Terms and your use of the Service.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="dispute">
            <AccordionTrigger className="text-lg font-semibold">13. Dispute Resolution</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Governing Law:</strong> These Terms and your use of the Service shall be governed by and 
                construed in accordance with the laws of the State of California, without giving effect to any 
                principles of conflicts of law.
              </p>
              <p>
                <strong>Arbitration:</strong> Any dispute arising from or relating to these Terms or the Service 
                shall be resolved by binding arbitration, rather than in court, except that you may assert claims 
                in small claims court if your claims qualify.
              </p>
              <p>
                The arbitration will be conducted by the American Arbitration Association (AAA) under its 
                Commercial Arbitration Rules. The arbitration will be conducted in [Your City, State], unless 
                you and {companyName} agree otherwise. The arbitrator's award shall be final and binding on 
                all parties.
              </p>
              <p>
                <strong>Class Action Waiver:</strong> YOU AND {companyName.toUpperCase()} AGREE THAT EACH MAY BRING CLAIMS AGAINST 
                THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY 
                PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. If this specific provision is found to be unenforceable, 
                then the entirety of this dispute resolution section shall be null and void.
              </p>
              <p>
                <strong>Injunctive Relief:</strong> Notwithstanding the foregoing, {companyName} may seek injunctive 
                or other equitable relief in any court of competent jurisdiction to protect its intellectual 
                property rights or to prevent irreparable harm.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="miscellaneous">
            <AccordionTrigger className="text-lg font-semibold">14. Miscellaneous</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                <strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy and any additional 
                terms incorporated by reference, constitute the entire agreement between you and {companyName} 
                regarding the Service and supersede all prior agreements and understandings.
              </p>
              <p>
                <strong>Waiver:</strong> The failure of {companyName} to enforce any right or provision of these 
                Terms will not be deemed a waiver of such right or provision.
              </p>
              <p>
                <strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable 
                by a court, the remaining provisions of these Terms will remain in effect.
              </p>
              <p>
                <strong>Assignment:</strong> You may not assign or transfer these Terms, by operation of law or 
                otherwise, without {companyName}'s prior written consent. {companyName} may assign or transfer 
                these Terms, at its sole discretion, without restriction.
              </p>
              <p>
                <strong>Notices:</strong> We may provide notices to you by email, through the Service, or by other 
                means. You may provide notices to us by contacting us at <a href="mailto:legal@{companyName.toLowerCase()}.com" className="text-primary underline">legal@{companyName.toLowerCase()}.com</a>.
              </p>
              <p>
                <strong>Headings:</strong> The section titles in these Terms are for convenience only and have no 
                legal or contractual effect.
              </p>
              <p>
                <strong>Force Majeure:</strong> We will not be liable for any failure or delay in performance due, 
                in whole or in part, to any cause beyond our reasonable control, including acts of God, flood, 
                fire, earthquake, civil unrest, acts of terror, strike or other labor problem, power or internet 
                outage, or acts of government.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="contact">
            <AccordionTrigger className="text-lg font-semibold">15. Contact Information</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none pl-6 mt-2">
                <li><strong>Email:</strong> <a href="mailto:legal@{companyName.toLowerCase()}.com" className="text-primary underline">legal@{companyName.toLowerCase()}.com</a></li>
                <li><strong>Mail:</strong> {companyName} Legal Department, 123 Emotion Street, San Francisco, CA 94103, USA</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TermsOfService;