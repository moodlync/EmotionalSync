import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * SessionHandler component
 * 
 * This component handles session persistence across page refreshes and provides
 * a friendly UI for handling session expirations.
 */
export default function SessionHandler() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);
  const [storedPath, setStoredPath] = useState<string | null>(null);
  
  // Store the current path when location changes (user navigates)
  useEffect(() => {
    if (location && !isLoading) {
      if (user && location !== '/auth') {
        // Only store paths when user is logged in and not on auth page
        localStorage.setItem('moodlync_last_path', location);
        // console.log('Path stored:', location);
      }
    }
  }, [location, user, isLoading]);
  
  // Check for session expiration (user was logged in before but not anymore)
  useEffect(() => {
    if (!isLoading) {
      const lastPath = localStorage.getItem('moodlync_last_path');
      
      // If we have a stored path but no user, it might indicate session expiration
      if (lastPath && !user && location !== '/auth' && !showSessionExpiredDialog) {
        setStoredPath(lastPath);
        setShowSessionExpiredDialog(true);
      }
    }
  }, [isLoading, user, location, showSessionExpiredDialog]);
  
  // Handle dialog close and redirect to auth page
  const handleLogin = () => {
    if (storedPath) {
      // Store the path in sessionStorage so we can redirect after login
      sessionStorage.setItem('redirectAfterAuth', storedPath);
    }
    setShowSessionExpiredDialog(false);
    navigate('/auth');
  };
  
  return (
    <Dialog open={showSessionExpiredDialog} onOpenChange={setShowSessionExpiredDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired or you've been logged out. Please log in again to continue where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="default" onClick={handleLogin} className="w-full sm:w-auto">
            Log in
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowSessionExpiredDialog(false);
              navigate('/welcome');
            }}
            className="w-full sm:w-auto"
          >
            Go to Welcome Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}