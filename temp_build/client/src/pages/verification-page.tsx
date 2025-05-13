import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VerificationForm from "@/components/verification/verification-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

export default function VerificationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user is premium
  const { data: premiumStatus, isLoading: isPremiumLoading } = useQuery({
    queryKey: ['/api/user/premium/status'],
    enabled: !!user,
  });
  
  const isPremium = premiumStatus?.isPremium;
  const isLoading = authLoading || isPremiumLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [authLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show premium required message if user is not premium
  if (!isPremium) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-yellow-200 shadow-md">
            <CardHeader className="bg-yellow-50 border-b border-yellow-100">
              <CardTitle className="text-center flex items-center justify-center gap-2 text-yellow-800">
                <Lock className="h-5 w-5" />
                Premium Feature
              </CardTitle>
              <CardDescription className="text-center text-yellow-700">
                Verification is a premium feature
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <ShieldCheck className="h-16 w-16 mx-auto text-yellow-500" />
                <h3 className="text-lg font-medium">Account Verification</h3>
                <p className="text-muted-foreground">
                  Account verification is available exclusively for premium members. Verified users 
                  receive a verification badge and access to enhanced platform features.
                </p>
                <div className="pt-4">
                  <Button onClick={() => setLocation("/premium")} variant="default">
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" />
          Account Verification
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <VerificationForm />
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
                <CardDescription>Why get verified?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Enhanced Trust</span>
                    <p className="text-muted-foreground">Show others you're a verified member</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">More Visibility</span>
                    <p className="text-muted-foreground">Verified profiles appear higher in search results</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Exclusive Features</span>
                    <p className="text-muted-foreground">Access to verified-only features and communities</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Enhanced Security</span>
                    <p className="text-muted-foreground">Additional account protection measures</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Process</CardTitle>
                <CardDescription>How verification works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Submit your verification documents</p>
                <p>2. Our team reviews your submission (1-3 days)</p>
                <p>3. Once approved, your badge appears on your profile</p>
                <p>4. Verification is valid for 1 year (can be renewed)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}