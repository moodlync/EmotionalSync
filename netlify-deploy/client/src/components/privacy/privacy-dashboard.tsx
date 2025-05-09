import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Download, Trash, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettingProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const PrivacySetting = ({ 
  id, 
  title, 
  description, 
  checked, 
  onChange 
}: PrivacySettingProps) => {
  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label 
          htmlFor={id} 
          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {title}
        </Label>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default function PrivacyDashboard() {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    locationTracking: false,
    emotionSharing: true,
    accountActivity: true,
    targetedContent: false,
    thirdPartySharing: false
  });

  // This would be replaced with a real API call in production
  const { data: privacyStatus } = useQuery({
    queryKey: ['/api/security/privacy/status'],
    queryFn: async () => {
      return {
        lastUpdated: 'May 6, 2025',
        dataRequests: 2,
        consentUpdates: 5,
        breachAlerts: 0
      };
    }
  });

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    
    toast({
      title: "Privacy Setting Updated",
      description: `${setting} is now ${value ? 'enabled' : 'disabled'}.`,
    });
    
    // This would call an API to update the setting in a real application
  };

  const handleDataRequest = () => {
    toast({
      title: "Data Export Requested",
      description: "Your data export has been requested and will be ready within 48 hours.",
    });
    // This would trigger a data export API call
  };

  const handleDeleteRequest = () => {
    toast({
      title: "Account Deletion Request",
      description: "Your account deletion has been scheduled. Your data will be fully removed within 30 days.",
      variant: "destructive",
    });
    // This would trigger an account deletion API call
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last Privacy Update
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyStatus?.lastUpdated || "Unknown"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Access Requests
            </CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyStatus?.dataRequests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Consent Updates
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyStatus?.consentUpdates || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Data Breach Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(privacyStatus?.breachAlerts || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {privacyStatus?.breachAlerts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Manage how your personal data is collected and used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacySetting
            id="data-collection"
            title="Data Collection"
            description="Allow MoodSync to collect anonymous usage data to improve the service"
            checked={privacySettings.dataCollection}
            onChange={(value) => handlePrivacyChange('dataCollection', value)}
          />
          <PrivacySetting
            id="location-tracking"
            title="Location Tracking"
            description="Allow MoodSync to access your location for the Global Emotion Map feature"
            checked={privacySettings.locationTracking}
            onChange={(value) => handlePrivacyChange('locationTracking', value)}
          />
          <PrivacySetting
            id="emotion-sharing"
            title="Emotion Sharing"
            description="Share your emotions with other users (anonymously by default)"
            checked={privacySettings.emotionSharing}
            onChange={(value) => handlePrivacyChange('emotionSharing', value)}
          />
          <PrivacySetting
            id="account-activity"
            title="Account Activity Monitoring"
            description="Track login attempts and account activity for security purposes"
            checked={privacySettings.accountActivity}
            onChange={(value) => handlePrivacyChange('accountActivity', value)}
          />
          <PrivacySetting
            id="targeted-content"
            title="Personalized Content"
            description="Allow MoodSync to show you personalized content based on your emotions"
            checked={privacySettings.targetedContent}
            onChange={(value) => handlePrivacyChange('targetedContent', value)}
          />
          <PrivacySetting
            id="third-party-sharing"
            title="Third-Party Data Sharing"
            description="Allow MoodSync to share anonymized data with trusted third parties"
            checked={privacySettings.thirdPartySharing}
            onChange={(value) => handlePrivacyChange('thirdPartySharing', value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={handleDataRequest}>
            <Download className="mr-2 h-4 w-4" />
            Request Data Export
          </Button>
          <Button variant="destructive" onClick={handleDeleteRequest}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}