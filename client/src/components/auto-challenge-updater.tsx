import { useEffect, useRef, useState } from 'react';
import { useGamification } from '@/hooks/use-gamification';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// This component doesn't render anything visible but handles automatic challenge updates
export default function AutoChallengeUpdater() {
  const { user } = useAuth();
  const { challenges, completeChallengeActivity } = useGamification();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Track last update time in a ref so it persists between renders
  const lastUpdateTimeRef = useRef<number>(Date.now());
  
  // Track which challenges were automatically updated to avoid duplicates
  const updatedChallengesRef = useRef<Set<string>>(new Set());

  // Function to check for challenges that should be automatically updated
  const checkAndUpdateChallenges = async () => {
    if (!user || !challenges || isUpdating) return;
    
    // Only update every 5 minutes maximum
    const currentTime = Date.now();
    if (currentTime - lastUpdateTimeRef.current < 5 * 60 * 1000) return;
    
    try {
      setIsUpdating(true);
      
      // Find challenges that can be automatically updated
      // These are usually daily login challenges or time-based challenges
      const autoUpdateChallenges = challenges.filter(challenge => 
        // Only consider incomplete challenges
        !challenge.isCompleted && 
        // Only update specific categories that make sense for auto-updates
        ['daily', 'tracking', 'login'].includes(challenge.category) &&
        // Don't update the same challenge twice in a session
        !updatedChallengesRef.current.has(challenge.id)
      );
      
      if (autoUpdateChallenges.length > 0) {
        // Pick one challenge to update
        const challengeToUpdate = autoUpdateChallenges[0];
        
        // Update the challenge
        const result = await completeChallengeActivity(challengeToUpdate.id);
        
        // Add to updated set
        updatedChallengesRef.current.add(challengeToUpdate.id);
        
        // Only show toast if user earned tokens
        if (result.tokensAwarded > 0) {
          toast({
            title: 'Challenge Progress Updated!',
            description: `${challengeToUpdate.title}: Progress automatically tracked!`,
          });
        }
        
        // Mark time of last update
        lastUpdateTimeRef.current = currentTime;
      }
    } catch (error) {
      console.error('Error in auto-updating challenges:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Effect to run the auto-updater at regular intervals
  useEffect(() => {
    // Check immediately on login
    checkAndUpdateChallenges();
    
    // Set up interval to check regularly (every 2 minutes)
    const intervalId = setInterval(() => {
      checkAndUpdateChallenges();
    }, 2 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, challenges]);
  
  // Reset updated challenges when the challenges data changes
  useEffect(() => {
    // When challenges data is refreshed, we can potentially update again
    if (challenges) {
      // Only reset for completely new data, not just re-renders
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/challenges'] });
    }
  }, [challenges]);

  // This component doesn't render anything visible
  return null;
}