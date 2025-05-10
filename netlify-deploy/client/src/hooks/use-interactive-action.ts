import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { debounce, sleep } from '@/lib/utils';

interface InteractiveActionOptions<T = any> {
  /** The function to execute when the action is triggered */
  actionFn: (...args: any[]) => Promise<T>;
  
  /** Function to call on successful execution */
  onSuccess?: (result: T) => void;
  
  /** Function to call on error */
  onError?: (error: Error) => void;
  
  /** Message to show when action succeeds */
  successMessage?: string;
  
  /** Message to show when action fails */
  errorMessage?: string;
  
  /** Message to show while action is in progress */
  loadingMessage?: string;
  
  /** Number of times to retry the action on failure */
  retryCount?: number;
  
  /** Delay in ms between retries */
  retryDelay?: number;
  
  /** Time in ms to debounce the action */
  debounceTime?: number;
  
  /** Whether the action is safe to retry automatically */
  isRetrySafe?: boolean;
  
  /** Whether to show a toast notification on success */
  showSuccessToast?: boolean;
  
  /** Whether to show a toast notification on error */
  showErrorToast?: boolean;
  
  /** Whether to show a toast notification while loading */
  showLoadingToast?: boolean;
}

interface InteractiveActionState<T = any> {
  /** Whether the action is currently executing */
  isLoading: boolean;
  
  /** The latest result from the action */
  result?: T;
  
  /** Whether the action was successful */
  isSuccess: boolean;
  
  /** Whether the action failed */
  isError: boolean;
  
  /** The error that occurred during the action */
  error: Error | null;
  
  /** The number of retries that have been attempted */
  retryAttempts: number;
  
  /** Whether the action is being retried */
  isRetrying: boolean;
}

interface InteractiveActionReturn<T = any> extends InteractiveActionState<T> {
  /** Execute the action */
  execute: (...args: any[]) => Promise<T | undefined>;
  
  /** Reset the action state */
  reset: () => void;
}

/**
 * Custom hook for handling interactive actions with built-in loading states,
 * error handling, success messages, and auto-retry functionality.
 */
export function useInteractiveAction<T = any>({
  actionFn,
  onSuccess,
  onError,
  successMessage,
  errorMessage = "Couldn't complete the action. Please try again.",
  loadingMessage,
  retryCount = 0,
  retryDelay = 1000,
  debounceTime = 300,
  isRetrySafe = true,
  showSuccessToast = true,
  showErrorToast = true,
  showLoadingToast = false,
}: InteractiveActionOptions<T>): InteractiveActionReturn<T> {
  // State for tracking action status
  const [state, setState] = useState<InteractiveActionState<T>>({
    isLoading: false,
    result: undefined,
    isSuccess: false,
    isError: false,
    error: null,
    retryAttempts: 0,
    isRetrying: false,
  });
  
  // Toast hook for notifications
  const { toast } = useToast();
  
  // Ref for tracking if component is mounted
  const isMounted = useRef(true);
  
  // Create a debounced action function
  const debouncedActionFn = useCallback(
    debounceTime > 0 ? debounce(actionFn, debounceTime) : actionFn,
    [actionFn, debounceTime]
  );
  
  // Reset the action state
  const reset = useCallback(() => {
    if (isMounted.current) {
      setState({
        isLoading: false,
        result: undefined,
        isSuccess: false,
        isError: false,
        error: null,
        retryAttempts: 0,
        isRetrying: false,
      });
    }
  }, []);
  
  // Execute the action with retries
  const executeWithRetries = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      try {
        // Show loading toast if configured
        let loadingToastId;
        if (showLoadingToast && loadingMessage) {
          loadingToastId = toast({
            title: "Loading",
            description: loadingMessage,
          });
        }
        
        // Execute the action
        const result = await debouncedActionFn(...args);
        
        // Update state if component is still mounted
        if (isMounted.current) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            result: result,
            isSuccess: true,
            isError: false,
            error: null,
            isRetrying: false,
          }));
        }
        
        // Show success toast if configured
        if (showSuccessToast && successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
        
        // Call onSuccess callback if provided
        if (onSuccess && result !== undefined) {
          onSuccess(result as T);
        }
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Action error:', err);
        
        // Update state if component is still mounted
        if (isMounted.current) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isSuccess: false,
            isError: true,
            error: err,
            retryAttempts: prev.retryAttempts + 1,
            isRetrying: false,
          }));
        }
        
        // Call onError callback if provided
        if (onError) {
          onError(err);
        }
        
        // Check if we should retry
        const shouldRetry = isRetrySafe && 
          state.retryAttempts < retryCount;
        
        if (shouldRetry) {
          // Show retry toast
          toast({
            title: "Retrying",
            description: `Retrying action... (${state.retryAttempts + 1}/${retryCount})`,
          });
          
          // Update retrying state
          if (isMounted.current) {
            setState(prev => ({
              ...prev,
              isRetrying: true,
            }));
          }
          
          // Wait before retrying
          await sleep(retryDelay);
          
          // Retry the action
          if (isMounted.current) {
            return executeWithRetries(...args);
          }
        } else {
          // Show error toast if configured
          if (showErrorToast) {
            toast({
              title: "Error",
              description: errorMessage || err.message,
              variant: "destructive",
            });
          }
        }
        
        return undefined;
      }
    },
    [
      debouncedActionFn,
      showLoadingToast,
      loadingMessage,
      showSuccessToast,
      successMessage,
      onSuccess,
      toast,
      state.retryAttempts,
      isRetrySafe,
      retryCount,
      retryDelay,
      showErrorToast,
      errorMessage,
      onError,
    ]
  );
  
  // Execute the action
  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      // Don't execute if already loading
      if (state.isLoading) return undefined;
      
      // Reset state before executing
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: true,
          isSuccess: false,
          isError: false,
          error: null,
          retryAttempts: 0,
          isRetrying: false,
        }));
      }
      
      return executeWithRetries(...args);
    },
    [state.isLoading, executeWithRetries]
  );
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return {
    execute,
    reset,
    ...state,
  };
}