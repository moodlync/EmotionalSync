import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, 
  Fingerprint, 
  Lock, 
  Key, 
  Scan, 
  FileText, 
  MonitorUp, 
  AlertTriangle, 
  UserX,
  Globe,
  Database,
  Eye,
  Headphones
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SecurityFeatureCard from '@/components/security/security-feature-card';
import SecurityStats from '@/components/security/security-stats';
import { useToast } from '@/hooks/use-toast';

export default function SecurityCenter() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock queries for demonstration - in production, these would fetch from our security API
  const { data: securityStatus } = useQuery({
    queryKey: ['/api/security/status'],
    queryFn: async () => {
      // This would be an actual API call in production
      return {
        activeFeatures: 3,
        securityScore: 68,
        vulnerabilities: 2,
        lastAudit: 'Today',
        features: {
          twoFactorAuth: false,
          biometricAuth: false,
          dataEncryption: true,
          passwordPolicies: true,
          deviceManagement: false,
          dataAccessControl: true,
          vulnerabilityScan: false,
          privacyConsent: true,
          accountRecovery: true
        },
        premiumFeatures: {
          advancedEncryption: false,
          securityAudits: false,
          threatProtection: false,
          remoteWipe: false
        }
      };
    }
  });

  const handleEnableFeature = (feature: string) => {
    toast({
      title: "Feature Activation",
      description: `${feature} setup started. Follow the instructions to complete activation.`,
    });
    // This would redirect to feature setup flow or open a modal
  };

  const handleLearnMore = (feature: string) => {
    toast({
      title: "Feature Information",
      description: `Opening detailed information about ${feature}.`,
    });
    // This would open a modal with detailed information
  };

  const runSecurityScan = () => {
    toast({
      title: "Security Scan",
      description: "Starting comprehensive security scan. This may take a few minutes.",
    });
    // This would trigger a security scan API call
  };

  if (!securityStatus) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Security Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and enhance your account security</p>
        </div>
        <Button onClick={runSecurityScan} className="mt-4 md:mt-0">
          <Shield className="mr-2 h-4 w-4" />
          Run Security Scan
        </Button>
      </div>

      <SecurityStats 
        activeFeatures={securityStatus.activeFeatures}
        securityScore={securityStatus.securityScore}
        vulnerabilities={securityStatus.vulnerabilities}
        lastAudit={securityStatus.lastAudit}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SecurityFeatureCard
              title="Two-Factor Authentication"
              description="Secure your account with an additional verification step during login."
              icon={Key}
              status={securityStatus.features.twoFactorAuth ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Two-Factor Authentication')}
              secondaryAction={() => handleLearnMore('Two-Factor Authentication')}
            />
            <SecurityFeatureCard
              title="Biometric Authentication"
              description="Use your fingerprint or face recognition to access your account securely."
              icon={Fingerprint}
              status={securityStatus.features.biometricAuth ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Biometric Authentication')}
              secondaryAction={() => handleLearnMore('Biometric Authentication')}
            />
            <SecurityFeatureCard
              title="End-to-End Encryption"
              description="Your messages and data are encrypted and can only be read by you and your intended recipients."
              icon={Lock}
              status={securityStatus.features.dataEncryption ? 'active' : 'inactive'}
              action={() => handleEnableFeature('End-to-End Encryption')}
              secondaryAction={() => handleLearnMore('End-to-End Encryption')}
            />
            <SecurityFeatureCard
              title="Advanced Encryption"
              description="Military-grade AES-256 encryption for all your sensitive data and communications."
              icon={Shield}
              status="premium"
              secondaryAction={() => handleLearnMore('Advanced Encryption')}
            />
            <SecurityFeatureCard
              title="Device Management"
              description="View and manage all devices that have access to your account."
              icon={MonitorUp}
              status={securityStatus.features.deviceManagement ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Device Management')}
              secondaryAction={() => handleLearnMore('Device Management')}
            />
            <SecurityFeatureCard
              title="Vulnerability Scanning"
              description="Regular scans to identify and fix potential security vulnerabilities."
              icon={Scan}
              status={securityStatus.features.vulnerabilityScan ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Vulnerability Scanning')}
              secondaryAction={() => handleLearnMore('Vulnerability Scanning')}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SecurityFeatureCard
              title="Password Policies"
              description="Enforce strong password requirements to prevent unauthorized access."
              icon={Key}
              status={securityStatus.features.passwordPolicies ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Password Policies')}
              secondaryAction={() => handleLearnMore('Password Policies')}
              actionLabel="Manage"
            />
            <SecurityFeatureCard
              title="Account Recovery"
              description="Set up secure methods to recover your account if you lose access."
              icon={UserX}
              status={securityStatus.features.accountRecovery ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Account Recovery')}
              secondaryAction={() => handleLearnMore('Account Recovery')}
              actionLabel="Configure"
            />
            <SecurityFeatureCard
              title="Security Audits"
              description="Comprehensive audits to identify and address security risks in your account."
              icon={FileText}
              status="premium"
              secondaryAction={() => handleLearnMore('Security Audits')}
            />
            <SecurityFeatureCard
              title="Suspicious Activity Alerts"
              description="Get notified of unusual login attempts or suspicious activities on your account."
              icon={AlertTriangle}
              status={securityStatus.features.deviceManagement ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Suspicious Activity Alerts')}
              secondaryAction={() => handleLearnMore('Suspicious Activity Alerts')}
              actionLabel="Configure"
            />
            <SecurityFeatureCard
              title="Remote Wipe"
              description="Remotely delete your data from devices you no longer have access to."
              icon={UserX}
              status="premium"
              secondaryAction={() => handleLearnMore('Remote Wipe')}
            />
            <SecurityFeatureCard
              title="Login History"
              description="View your recent login activity to detect any unauthorized access."
              icon={MonitorUp}
              status={securityStatus.features.deviceManagement ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Login History')}
              secondaryAction={() => handleLearnMore('Login History')}
              actionLabel="View"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SecurityFeatureCard
              title="Data Access Control"
              description="Control which applications and services can access your data."
              icon={Eye}
              status={securityStatus.features.dataAccessControl ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Data Access Control')}
              secondaryAction={() => handleLearnMore('Data Access Control')}
              actionLabel="Manage"
            />
            <SecurityFeatureCard
              title="Privacy Consent Management"
              description="Manage your privacy preferences and consent for data usage."
              icon={FileText}
              status={securityStatus.features.privacyConsent ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Privacy Consent Management')}
              secondaryAction={() => handleLearnMore('Privacy Consent Management')}
              actionLabel="Review"
            />
            <SecurityFeatureCard
              title="Data Backup"
              description="Secure backup of your important data to prevent loss."
              icon={Database}
              status="premium"
              secondaryAction={() => handleLearnMore('Data Backup')}
            />
            <SecurityFeatureCard
              title="Threat Protection"
              description="Advanced protection against phishing, malware, and other online threats."
              icon={Shield}
              status="premium"
              secondaryAction={() => handleLearnMore('Threat Protection')}
            />
            <SecurityFeatureCard
              title="Data Location Controls"
              description="Choose where your data is stored and processed geographically."
              icon={Globe}
              status={securityStatus.features.dataAccessControl ? 'active' : 'inactive'}
              action={() => handleEnableFeature('Data Location Controls')}
              secondaryAction={() => handleLearnMore('Data Location Controls')}
              actionLabel="Configure"
            />
            <SecurityFeatureCard
              title="24/7 Security Support"
              description="Access to dedicated security experts for any security concerns."
              icon={Headphones}
              status="premium"
              secondaryAction={() => handleLearnMore('Security Support')}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}