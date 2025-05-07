import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import NotificationCenter from "@/components/notifications/notification-center";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProfileNotificationsPage() {
  const { user, isLoading } = useAuth();

  // If not authenticated, redirect to auth page
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="sm" className="mr-4">
          <Link to="/profile" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Your Notifications</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        user && <NotificationCenter userId={user.id} showEmptyState={true} />
      )}
    </div>
  );
}