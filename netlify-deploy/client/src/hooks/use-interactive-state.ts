import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useInteractiveAction } from '@/hooks/use-interactive-action';

interface InteractiveStateOptions<T> {
  /** Initial state value */
  initialValue: T;
  
  /** Function to save the updated state (return the new value or a Promise of the new value) */
  onUpdate?: (newValue: T) => Promise<T> | T;
  
  /** Function to call when update succeeds */
  onSuccess?: (newValue: T) => void;
  
  /** Function to call when update fails */
  onError?: (error: Error) => void;
  
  /** Message to show on successful update */
  successMessage?: string;
  
  /** Message to show on failed update */
  errorMessage?: string;
  
  /** Message to show while updating */
  loadingMessage?: string;
  
  /** Number of times to retry updates on failure */
  retryCount?: number;
  
  /** Delay in ms between retries */
  retryDelay?: number;
  
  /** Whether to automatically retry updates */
  autoRetry?: boolean;
  
  /** Whether to validate state changes before updating */
  validate?: (newValue: T) => boolean | string | Promise<boolean | string>;
  
  /** Whether to allow optimistic UI updates */
  optimistic?: boolean;
  
  /** Whether to keep local changes on error */
  keepChangesOnError?: boolean;
}

interface InteractiveStateReturn<T> {
  /** Current state value */
  value: T;
  
  /** Update the state value */
  setValue: (newValue: T) => Promise<void>;
  
  /** Reset to initial value */
  reset: () => void;
  
  /** Whether an update is in progress */
  isLoading: boolean;
  
  /** Error that occurred during the last update */
  error: Error | null;
  
  /** Whether the last update was successful */
  isSuccess: boolean;
  
  /** Timestamp of the last successful update */
  lastUpdated: number | null;
}

/**
 * Custom hook for managing state with asynchronous updates, built-in loading states,
 * error handling, validation, and retry functionality.
 */
export function useInteractiveState<T>({
  initialValue,
  onUpdate,
  onSuccess,
  onError,
  successMessage,
  errorMessage = "Couldn't update the value. Please try again.",
  loadingMessage = "Updating...",
  retryCount = 0,
  retryDelay = 1000,
  autoRetry = false,
  validate,
  optimistic = false,
  keepChangesOnError = false,
}: InteractiveStateOptions<T>): InteractiveStateReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const previousValue = useRef<T>(initialValue);
  const { toast } = useToast();
  
  // Setup the interactive action for state updates
  const {
    execute,
    isLoading,
    error,
    isSuccess,
    reset: resetAction,
  } = useInteractiveAction({
    actionFn: async (newValue: T) => {
      try {
        // If validation is provided, run it
        if (validate) {
          const validationResult = await validate(newValue);
          
          // If validation returns a string, it's an error message
          if (typeof validationResult === 'string') {
            toast({
              title: "Validation Error",
              description: validationResult,
              variant: "destructive",
            });
            return value; // Return the current value
          }
          
          // If validation returns false, it failed
          if (validationResult === false) {
            toast({
              title: "Validation Error",
              description: "The provided value is invalid.",
              variant: "destructive",
            });
            return value; // Return the current value
          }
        }
        
        // Store the previous value
        previousValue.current = value;
        
        // If optimistic updates are enabled, update the value immediately
        if (optimistic) {
          setValue(newValue);
        }
        
        // If there's an update handler, call it
        if (onUpdate) {
          const result = await onUpdate(newValue);
          
          // Update the value with the result from the handler
          setValue(result);
          setLastUpdated(Date.now());
          
          return result;
        }
        
        // Otherwise just update the value
        setValue(newValue);
        setLastUpdated(Date.now());
        
        return newValue;
      } catch (err) {
        console.error('State update error:', err);
        
        // If we should keep changes on error, don't revert the value
        if (!keepChangesOnError && optimistic) {
          // Revert to the previous value if the update failed
          setValue(previousValue.current);
        }
        
        throw err;
      }
    },
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    loadingMessage,
    retryCount: autoRetry ? retryCount : 0,
    retryDelay,
    isRetrySafe: autoRetry,
  });
  
  // Update the value with proper error handling
  const updateValue = useCallback(async (newValue: T) => {
    try {
      await execute(newValue);
    } catch (err) {
      console.error('State update handling error:', err);
    }
  }, [execute]);
  
  // Reset to initial value
  const reset = useCallback(() => {
    setValue(initialValue);
    resetAction();
    setLastUpdated(null);
  }, [initialValue, resetAction]);
  
  // Clean up
  useEffect(() => {
    return () => {
      resetAction();
    };
  }, [resetAction]);
  
  return {
    value,
    setValue: updateValue,
    reset,
    isLoading,
    error,
    isSuccess,
    lastUpdated,
  };
}