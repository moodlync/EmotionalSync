import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Trash, Database, FileText, AlertTriangle, Clock, Ban } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

export default function AccountDataManagement() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/account/delete');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been submitted. You will receive an email confirmation. Your account will be fully deleted in 3-7 business days.",
      });
      // Log the user out after successful request
      logoutMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request account deletion",
        variant: "destructive"
      });
    }
  });

  // Delete data mutation
  const deleteDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/account/delete-data');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Data Deletion Requested",
        description: "Your data deletion request has been submitted. You will receive an email confirmation. Your data will be fully removed in 3-7 business days.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to request data deletion",
        variant: "destructive"
      });
    }
  });

  // Check if user has premium subscription
  const isPremium = user?.isPremium;
  
  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/cancel');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Cancelled",
        description: `Your subscription has been cancelled. You will continue to have premium access until ${new Date(data.expiresAt).toLocaleDateString()}.`,
      });
      // Update UI if needed
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  });

  // Renew subscription mutation
  const renewSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/renew');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Renewed",
        description: "Your subscription has been renewed successfully.",
      });
      // Update UI if needed
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to renew subscription",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Subscription Management Section - Only show if user has premium */}
      {isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Subscription Management
            </CardTitle>
            <CardDescription>
              Manage your premium subscription settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Current Plan</h3>
                <div className="flex items-center mt-1">
                  <p className="text-sm text-muted-foreground mr-2">
                    {user?.premiumPlanType || "Premium"}
                  </p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">Active</Badge>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium">Renews On</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.premiumExpiryDate 
                    ? new Date(user.premiumExpiryDate).toLocaleDateString() 
                    : "Not available"}
                </p>
              </div>
            </div>

            <Separator />
            
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mr-2" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Important Information</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Cancelling your subscription will not provide a refund unless you are within the 14-day money-back guarantee period</li>
                    <li>You will continue to have premium access until your current period ends</li>
                    <li>After cancellation, your account will revert to the free plan</li>
                    <li>If you're within 14 days of your initial purchase, contact support for a refund</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Your Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <p className="mb-2">
                      Are you sure you want to cancel your subscription? You will continue to have premium access until your current period ends on <strong>{user?.premiumExpiryDate 
                      ? new Date(user.premiumExpiryDate).toLocaleDateString() 
                      : "N/A"}</strong>.
                    </p>
                    <p className="mb-2">
                      <strong>Refund Policy:</strong> If you're within the 14-day money-back guarantee period of your initial purchase, 
                      please contact our support team for a full refund. Otherwise, no refunds will be issued for the current billing period.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep My Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelSubscriptionMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Only show renew button if subscription is cancelled but still active */}
            {user?.subscriptionCancelled && (
              <Button 
                variant="default"
                onClick={() => renewSubscriptionMutation.mutate()}
                disabled={renewSubscriptionMutation.isPending}
              >
                {renewSubscriptionMutation.isPending ? "Processing..." : "Renew Subscription"}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-500" />
            Account & Data Management
          </CardTitle>
          <CardDescription>
            Options for managing your personal data and account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-base font-medium mb-2">Data Deletion</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Request deletion of your personal data while keeping your account active.
              This will remove your emotional data, posts, and personal information.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Data Deletion
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Your Personal Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <p className="mb-2">
                      This will permanently remove your personal data from our systems, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Emotional tracking history</li>
                      <li>User-generated content</li>
                      <li>Personal information</li>
                    </ul>
                    <p className="mb-2">
                      Your account will remain active but with minimal information.
                      This process takes 3-7 business days to complete and cannot be undone.
                    </p>
                    <p>
                      You will receive an email confirmation once your data has been deleted.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteDataMutation.mutate()}
                    className="bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Delete My Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-base font-medium mb-2 text-red-600">Account Deletion</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your entire account including all data, posts, and subscription information.
              This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Your Account Permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <p className="mb-2">
                      This will permanently delete your account and all associated data:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li>Your profile and all personal information</li>
                      <li>All emotional tracking data</li>
                      <li>All posts, messages, and content</li>
                      <li>Your subscription (subject to our 14-day money-back guarantee policy)</li>
                    </ul>
                    <p className="mb-2">
                      This process takes 3-7 business days to complete and <strong>cannot be undone</strong>.
                    </p>
                    <p>
                      You will receive an email confirmation when the process begins and when it completes.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAccountMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Permanently Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}