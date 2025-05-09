import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Fingerprint, Smartphone, KeyRound, AlertCircle, ShieldCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';

interface BiometricAuthProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRegisterDevice: () => void;
  onRemoveDevice: (deviceId: string) => void;
}

interface Device {
  id: string;
  name: string;
  lastUsed: string;
  type: 'fingerprint' | 'face' | 'device';
}

export default function BiometricAuth({
  isEnabled = false,
  onToggle,
  onRegisterDevice,
  onRemoveDevice
}: BiometricAuthProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Mock data - in a real app this would come from the server
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'device-1',
      name: 'iPhone 14 Pro',
      lastUsed: 'Today, 9:32 AM',
      type: 'face'
    },
    {
      id: 'device-2',
      name: 'Windows Laptop',
      lastUsed: 'Yesterday, 3:15 PM',
      type: 'fingerprint'
    }
  ]);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (checked && devices.length === 0) {
        // If enabling but no devices registered, prompt to register
        toast({
          title: "No biometric devices",
          description: "Please register at least one device to enable biometric authentication.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      onToggle(checked);
      
      toast({
        title: checked ? "Biometric Authentication Enabled" : "Biometric Authentication Disabled",
        description: checked 
          ? "You can now sign in using your registered biometric devices." 
          : "Standard password authentication will be required for sign-in.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update biometric settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async () => {
    setLoading(true);
    
    try {
      // Simulate network request and device registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would involve device-specific biometric registration
      // and communication with the server to register the credentials
      
      onRegisterDevice();
      
      // Add the new device to the list (simulated)
      const newDevice: Device = {
        id: `device-${devices.length + 1}`,
        name: `Device ${devices.length + 1}`,
        lastUsed: 'Just now',
        type: 'fingerprint'
      };
      
      setDevices([...devices, newDevice]);
      
      toast({
        title: "Device Registered",
        description: "Your device has been registered for biometric authentication.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register your device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onRemoveDevice(deviceId);
      
      // Remove the device from the list
      setDevices(devices.filter(device => device.id !== deviceId));
      
      toast({
        title: "Device Removed",
        description: "The device has been removed from your biometric authentication options.",
      });
      
      // If no devices left and biometric auth is on, turn it off
      if (devices.length === 1 && isEnabled) {
        onToggle(false);
        toast({
          title: "Biometric Authentication Disabled",
          description: "No devices remaining for biometric authentication.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'fingerprint':
        return <Fingerprint className="h-5 w-5 text-blue-600" />;
      case 'face':
        return <Smartphone className="h-5 w-5 text-green-600" />;
      default:
        return <KeyRound className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>
                Sign in using your fingerprint, face, or device security
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="biometric-toggle" className="sr-only">
                Enable Biometric Authentication
              </Label>
              <Switch
                id="biometric-toggle"
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Enhanced Security</AlertTitle>
            <AlertDescription>
              Biometric authentication adds an extra layer of security to your account. 
              Your biometric data never leaves your device.
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Registered Devices</h3>
              <Button 
                onClick={handleRegisterDevice} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Register New Device
              </Button>
            </div>
            
            {devices.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h4 className="text-lg font-semibold">No devices registered</h4>
                <p className="text-muted-foreground mt-1">
                  Register a device to use biometric authentication
                </p>
                <Button 
                  onClick={handleRegisterDevice} 
                  className="mt-4"
                  disabled={loading}
                >
                  Register Device
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div 
                    key={device.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      {getDeviceIcon(device.type)}
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last used: {device.lastUsed}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveDevice(device.id)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            You can register up to 5 different devices for biometric authentication.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}