import React from 'react';
import Layout from '@/components/layout';
import { Shield, Lock, Eye, Database, Key, FileCheck, Gauge, UserCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SecurityPage() {
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              Your Data, Your Privacy, Our Priority
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              MoodLync employs enterprise-grade security measures to protect your emotional data and ensure your privacy is maintained at all times.
            </p>
          </div>

          <Tabs defaultValue="encryption" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
              <TabsTrigger value="encryption" className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                <span>Encryption</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4" />
                <span>Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encryption" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    End-to-End Encryption
                  </CardTitle>
                  <CardDescription>
                    Military-grade protection for your emotional journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">AES-256</Badge> 
                        Data Encryption
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        All your sensitive data including chats, mood logs, and journal entries are encrypted both in transit and at rest using AES-256 encryption, keeping your information secure.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">Signal Protocol</Badge> 
                        Secure Messaging
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        MoodLync leverages the same encryption technology used by Signal for all real-time messaging, ensuring your conversations remain private and secure.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">ZKPs</Badge> 
                        Zero-Knowledge Proofs
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Verify milestones and achievements without exposing your underlying data, perfect for Emotion NFTs and social sharing while maintaining privacy.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">TLS 1.3</Badge> 
                        Secure Transport
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        All data transmissions use the latest TLS 1.3 protocol to ensure maximum security when your data moves between your device and our servers.
                      </p>
                    </div>
                  </div>

                  <div className="bg-violet-50 dark:bg-violet-950/20 p-4 rounded-lg border border-violet-100 dark:border-violet-800/30">
                    <h3 className="text-lg font-medium mb-2 text-violet-700 dark:text-violet-300">Example: Secure Journal Entry</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>You write a journal entry "Feeling anxious today"</li>
                      <li>Entry is immediately encrypted on your device</li>
                      <li>Data transmits via secure TLS 1.3 connection</li>
                      <li>Stored in our sharded, encrypted databases</li>
                      <li>Family plan members only see aggregate stats (e.g., "Anxiety: 20% ↑") unless you explicitly grant access</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Privacy by Design
                  </CardTitle>
                  <CardDescription>
                    Built from the ground up with your privacy as a cornerstone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" /> 
                        Minimal Data Collection
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        We only store essential data—no precise GPS locations (just approximate for heatmaps), no unnecessary personal details, and you can use a pseudonym instead of your real name.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">On-Device</Badge>
                        Local Processing
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        When possible, AI mood detection runs locally on your device using TensorFlow Lite, keeping your raw emotional data on your device and preventing cloud exposure.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-primary" /> 
                        User Control
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your data is yours—control exactly who can see what with granular privacy settings, create multiple mood viewing circles with different access levels.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">Blockchain</Badge>
                        Immutable Consent
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permissions you grant (like sharing data with therapists) are stored on a private Hyperledger blockchain, creating an unalterable record of your consent.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <h3 className="text-lg font-medium mb-2">Privacy Dashboard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      MoodLync provides a comprehensive Privacy Dashboard where you can:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>View and revoke third-party access permissions</li>
                      <li>See who has viewed your emotional data</li>
                      <li>Download your complete data export</li>
                      <li>Request complete account deletion with one click</li>
                      <li>Control notification privacy settings</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Compliance & Standards
                  </CardTitle>
                  <CardDescription>
                    Meeting and exceeding international data protection standards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge className="bg-blue-500 hover:bg-blue-500/80">GDPR</Badge>
                        European Compliance
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full compliance with the EU's General Data Protection Regulation, including explicit consent mechanisms, data portability, and the right to be forgotten.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge className="bg-amber-500 hover:bg-amber-500/80">CCPA</Badge>
                        California Privacy
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Meets all California Consumer Privacy Act requirements, giving California residents enhanced control over their personal information.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge className="bg-teal-500 hover:bg-teal-500/80">HIPAA</Badge>
                        Healthcare Compliance
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For therapy integrations, all communications are HIPAA-compliant with encrypted therapist-patient communications and comprehensive audit logs.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Badge className="bg-indigo-500 hover:bg-indigo-500/80">SOC 2</Badge>
                        Security Certification
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        MoodLync undergoes regular SOC 2 audits to verify our security controls, organizational oversight, vendor management, and risk mitigation procedures.
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
                    <h3 className="text-lg font-medium mb-2 text-green-700 dark:text-green-300">Open-Source Security</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      We believe in transparency as a security principle:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>Published security whitepapers and design documents</li>
                      <li>Regular third-party security audits with published results</li>
                      <li>Public vulnerability disclosure program with bounties</li>
                      <li>Core encryption libraries available for community review</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Comprehensive Security Infrastructure
                  </CardTitle>
                  <CardDescription>
                    Advanced measures to protect against threats and ensure data integrity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        Secure Authentication
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Biometric login support (Face ID/fingerprint), hardware security key compatibility (YubiKey), and multi-factor authentication for all accounts.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Threat Protection
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anti-bruteforce measures with rate-limiting and CAPTCHA after failed attempts, sophisticated firewall, and DDoS protection systems.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-primary" />
                        Real-Time Monitoring
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anomaly detection systems powered by AWS GuardDuty and Sentry to identify unusual patterns and potential security incidents in real-time.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        Backup & Recovery
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Geo-redundant distributed backups with AWS S3 and Glacier, 7-day rollback capability, and immutable backups to protect against ransomware attacks.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-lg font-medium mb-2 text-blue-700 dark:text-blue-300">NFT Security</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Special security measures for blockchain features:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>Soulbound tokens (non-transferable) prevent NFT exploitation</li>
                      <li>Zero-knowledge proofs verify milestone completion without exposing raw emotional data</li>
                      <li>Smart contract audits by leading blockchain security firms</li>
                      <li>Cold storage for long-term NFT preservation</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20">
                    <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Penetration Testing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      MoodLync regularly engages ethical hackers to probe for vulnerabilities, with particular focus on the OWASP Top 10 web application security risks. This continuous testing helps us stay ahead of potential threats and ensures your data remains secure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Your Security Is Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
              MoodLync was built from the ground up with security and privacy as core principles, not afterthoughts. We understand the deeply personal nature of emotional data and have implemented multiple layers of protection to ensure your journey remains private and secure.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a href="/privacy" className="inline-flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors">
                <Eye className="mr-2 h-4 w-4" />
                Privacy Policy
              </a>
              <a href="/terms" className="inline-flex items-center px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors">
                <FileCheck className="mr-2 h-4 w-4" />
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}