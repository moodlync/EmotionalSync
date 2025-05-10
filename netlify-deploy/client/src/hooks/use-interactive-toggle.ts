import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInteractiveAction } from '@/hooks/use-interactive-action';

interface InteractiveToggleOptions {
  initialValue?: boolean;
  onToggle?: (newValue: boolean) => Promise<void> | void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  retryCount?: number;
  retryDelay?: number;
  autoRetry?: boolean;
}

interface InteractiveToggleReturn {
  value: boolean;
  toggle: () => Promise<void>;
  setValue: (newValue: boolean) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for handling toggle controls with built-in loading states,
 * error handling, and auto-retry functionality.
 */
export function useInteractiveToggle({
  initialValue = false,
  onToggle,
  onError,
  successMessage,
  errorMessage = "Couldn't update the setting. Please try again.",
  loadingMessage = "Updating...",
  retryCount = 2,
  retryDelay = 1000,
  autoRetry = true,
}: InteractiveToggleOptions): InteractiveToggleReturn {
  const [value, setInternalValue] = useState<boolean>(initialValue);
  const { toast } = useToast();
  
  // Setup the interactive action for toggle operation
  const {
    execute: executeAction,
    isLoading,
    error,
    reset: resetAction,
  } = useInteractiveAction({
    actionFn: async (newValueArg: boolean) => {
      try {
        // If there's a toggle handler, call it
        if (onToggle) {
          await onToggle(newValueArg);
        }
        
        // Update the internal value
        setInternalValue(newValueArg);
        return newValueArg;
      } catch (err) {
        console.error('Toggle action error:', err);
        throw err;
      }
    },
    onError,
    successMessage,
    errorMessage,
    loadingMessage,
    retryCount: autoRetry ? retryCount : 0,
    retryDelay,
    isRetrySafe: autoRetry,
  });
  
  // Reset the toggle state
  const reset = useCallback(() => {
    resetAction();
  }, [resetAction]);
  
  // Handle toggle
  const toggle = useCallback(async () => {
    try {
      // First check internet connection
      if (!navigator.onLine) {
        toast({
          title: "You're Offline",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Execute the toggle action
      await executeAction(!value);
    } catch (err) {
      console.error('Toggle handling error:', err);
    }
  }, [executeAction, value, toast]);
  
  // Set to a specific value
  const setValue = useCallback(async (newValue: boolean) => {
    try {
      // First check internet connection
      if (!navigator.onLine) {
        toast({
          title: "You're Offline",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Don't execute if the value is already set
      if (newValue === value) return;
      
      // Execute the toggle action
      await executeAction(newValue);
    } catch (err) {
      console.error('Toggle handling error:', err);
    }
  }, [executeAction, value, toast]);
  
  return {
    value,
    toggle,
    setValue,
    isLoading,
    error,
    reset,
  };
}