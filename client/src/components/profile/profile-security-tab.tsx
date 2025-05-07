import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Copy, Key, AlertTriangle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProfileSecurityTab() {
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<null | {
    qrCodeUrl: string;
    secret: string;
    backupCodes: string[];
    recoveryKey: string;
  }>(null);
  
  const [showSecret, setShowSecret] = useState(false);
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupStep, setSetupStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query 2FA status
  const { data: twoFactorStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['/api/auth/2fa/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/auth/2fa/status');
      return response.json();
    }
  });

  // Setup 2FA
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/2fa/setup');
      return response.json();
    },
    onSuccess: (data) => {
      setTwoFactorSetupData(data);
      setSetupStep(2);
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Verify and enable 2FA
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/2fa/verify', {
        token: verificationCode
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account"
      });
      setSetupStep(3);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/2fa/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/2fa/disable', {
        token
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/2fa/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate new backup codes
  const newBackupCodesMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/2fa/new-backup-codes', {
        token
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "New Backup Codes",
        description: "New backup codes have been generated",
      });
      setTwoFactorSetupData(prev => prev ? { ...prev, backupCodes: data.backupCodes } : null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate new recovery key
  const newRecoveryKeyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/2fa/new-recovery-key', {
        token
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "New Recovery Key",
        description: "A new recovery key has been generated",
      });
      setTwoFactorSetupData(prev => prev ? { ...prev, recoveryKey: data.recoveryKey } : null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Copy to clipboard helper
  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${item} copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    });
  };

  if (isStatusLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (twoFactorStatus?.enabled) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Your account is protected with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm font-medium text-green-800">
                  Two-factor authentication is enabled for your account
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Backup Codes</h3>
              <p className="text-sm text-muted-foreground">
                If you lose access to your authentication app, you can use these backup codes to sign in.
                Each code can only be used once.
              </p>
              
              <div className="rounded-md bg-muted p-4">
                <div className="grid grid-cols-2 gap-2">
                  {twoFactorSetupData?.backupCodes ? (
                    twoFactorSetupData.backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-xs">
                        {code}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm col-span-2">
                      Backup codes are not available. Generate new ones.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-36"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => newBackupCodesMutation.mutate(verificationCode)}
                  disabled={newBackupCodesMutation.isPending || verificationCode.length !== 6}
                >
                  {newBackupCodesMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Generate New Codes
                </Button>
                {twoFactorSetupData?.backupCodes ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(twoFactorSetupData.backupCodes.join('\n'), 'Backup codes')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium">Recovery Key</h3>
              <p className="text-sm text-muted-foreground">
                Your recovery key is a secure way to regain access to your account if you lose your device
                and backup codes. Keep it in a safe place.
              </p>
              
              <div className="relative">
                <Input
                  type={showRecoveryKey ? "text" : "password"}
                  value={twoFactorSetupData?.recoveryKey || "••••••••••••••••••••••••••"}
                  readOnly
                  className="font-mono pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                >
                  {showRecoveryKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-36"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => newRecoveryKeyMutation.mutate(verificationCode)}
                  disabled={newRecoveryKeyMutation.isPending || verificationCode.length !== 6}
                >
                  {newRecoveryKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Generate New Key
                </Button>
                {twoFactorSetupData?.recoveryKey ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(twoFactorSetupData.recoveryKey, 'Recovery key')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Key className="h-4 w-4 mr-2" />
              Disable two-factor authentication
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-36"
              />
              <Button
                variant="destructive"
                onClick={() => disableMutation.mutate(verificationCode)}
                disabled={disableMutation.isPending || verificationCode.length !== 6}
              >
                {disableMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Disable 2FA
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {setupStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm">
                Two-factor authentication adds an extra layer of security to your account. In addition to your password, 
                you'll need to enter a code from your authenticator app when signing in.
              </p>
              
              <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Important</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator</li>
                      <li>We'll provide backup codes you should save in a secure place</li>
                      <li>You'll also receive a recovery key - store it separately from your backup codes</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
                className="w-full sm:w-auto"
              >
                {setupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Set Up Two-Factor Authentication
              </Button>
            </div>
          )}

          {setupStep === 2 && twoFactorSetupData && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">1. Scan QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                <div className="flex justify-center">
                  <img 
                    src={twoFactorSetupData.qrCodeUrl} 
                    alt="QR Code" 
                    className="border rounded-md p-2 bg-white"
                    style={{ width: '200px', height: '200px' }}
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    If you can't scan the QR code, enter this code manually:
                  </p>
                  <div className="relative">
                    <Input
                      type={showSecret ? "text" : "password"}
                      value={twoFactorSetupData.secret}
                      readOnly
                      className="font-mono pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(twoFactorSetupData.secret, 'Secret key')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Secret Key
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">2. Backup Codes</h3>
                <p className="text-sm text-muted-foreground">
                  Save these backup codes in a secure place. If you lose your device, you can use these to sign in.
                  Each code can only be used once.
                </p>
                
                <div className="bg-muted p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    {twoFactorSetupData.backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-xs">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(twoFactorSetupData.backupCodes.join('\n'), 'Backup codes')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Backup Codes
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">3. Recovery Key</h3>
                <p className="text-sm text-muted-foreground">
                  Save this recovery key in a secure place different from your backup codes. You'll need it if you lose access 
                  to your device and backup codes.
                </p>
                
                <div className="relative">
                  <Input
                    type={showRecoveryKey ? "text" : "password"}
                    value={twoFactorSetupData.recoveryKey}
                    readOnly
                    className="font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-7 w-7 p-0"
                    onClick={() => setShowRecoveryKey(!showRecoveryKey)}
                  >
                    {showRecoveryKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(twoFactorSetupData.recoveryKey, 'Recovery key')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Recovery Key
                </Button>
                
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> Store your recovery key in a secure location separate from your 
                      backup codes. Anyone with this key can bypass 2FA on your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">4. Verify Code</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the verification code from your authenticator app to complete setup
                </p>
                
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    placeholder="6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="w-36"
                  />
                  
                  <Button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending || verificationCode.length !== 6}
                  >
                    {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify and Enable
                  </Button>
                </div>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="font-medium text-green-800">Two-factor authentication enabled</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your account is now protected with two-factor authentication. When signing in, you'll need to 
                    provide your password and a verification code from your authenticator app.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}