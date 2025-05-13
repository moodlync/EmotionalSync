import React, { useState, useEffect, useRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useInteractiveAction } from '@/hooks/use-interactive-action';
import { cn, addClassSafely, removeClassSafely } from '@/lib/utils';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Omit the original onError prop from ButtonProps to avoid conflict
type ButtonPropsWithoutOnError = Omit<ButtonProps, 'onError'>;

export interface InteractiveButtonProps extends ButtonPropsWithoutOnError {
  /** Async function to execute when the button is clicked */
  onClick?: () => Promise<any>;
  
  /** Message to display when the action is loading */
  loadingMessage?: string;
  
  /** Message to display when the action succeeds */
  successMessage?: string;
  
  /** Message to display when the action fails */
  errorMessage?: string;
  
  /** Whether to automatically retry on failure */
  autoRetry?: boolean;
  
  /** Number of times to retry on failure */
  retryCount?: number;
  
  /** Time in milliseconds between retries */
  retryDelay?: number;
  
  /** Function to call when the action succeeds */
  onSuccess?: (result: any) => void;
  
  /** Function to call when the action fails */
  onErrorAction?: (error: Error) => void;
  
  /** Time in milliseconds to debounce clicks */
  debounceTime?: number;
  
  /** Whether to display the success animation */
  showSuccessAnimation?: boolean;
  
  /** Time in milliseconds to show the success animation */
  successAnimationDuration?: number;
  
  /** Whether to queue actions when offline for later execution */
  queueOfflineActions?: boolean;
  
  /** ID for identifying the button action (needed for offline queue) */
  actionId?: string;
  
  /** Whether to add a pressed visual effect */
  addPressedEffect?: boolean;
}

/**
 * Enhanced button component with built-in loading state, success animation,
 * error handling, and retry functionality.
 */
export function InteractiveButton({
  children,
  onClick,
  loadingMessage,
  successMessage,
  errorMessage = "Couldn't complete action. Please try again.",
  autoRetry = true,
  retryCount = 2,
  retryDelay = 1000,
  onSuccess,
  onErrorAction,
  debounceTime = 300,
  showSuccessAnimation = true,
  successAnimationDuration = 1500,
  queueOfflineActions = false,
  actionId,
  addPressedEffect = true,
  className,
  disabled,
  ...props
}: InteractiveButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Setup the interactive action
  const {
    execute,
    isLoading,
    error,
    isSuccess,
    reset
  } = useInteractiveAction({
    actionFn: async () => {
      try {
        // If there's no click handler, just return
        if (!onClick) return undefined;
        
        // Add pressed effect
        if (addPressedEffect && buttonRef.current) {
          addClassSafely(buttonRef.current, 'scale-95');
          addClassSafely(buttonRef.current, 'opacity-80');
          
          setTimeout(() => {
            removeClassSafely(buttonRef.current, 'scale-95');
            removeClassSafely(buttonRef.current, 'opacity-80');
          }, 200);
        }
        
        // Execute the action
        return await onClick();
      } catch (error) {
        console.error('Button action error:', error);
        throw error; // Re-throw to be handled by the hook
      }
    },
    onSuccess: (result) => {
      // Show success animation if configured
      if (showSuccessAnimation) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, successAnimationDuration);
      }
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    },
    onError: onErrorAction,
    successMessage,
    errorMessage,
    retryCount: autoRetry ? retryCount : 0,
    retryDelay,
    debounceTime,
    loadingMessage,
    isRetrySafe: autoRetry,
  });
  
  // Reset on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);
  
  // Handle button click
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Don't execute if already loading or disabled
    if (isLoading || disabled) return;
    
    // Execute the action
    execute();
  };
  
  return (
    <Button
      ref={buttonRef}
      className={cn(
        'relative transition-all duration-200',
        showSuccess && 'bg-green-500 hover:bg-green-600',
        addPressedEffect && 'active:scale-95 active:opacity-80',
        className
      )}
      onClick={handleButtonClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      
      {/* Success icon */}
      {showSuccess && !isLoading && (
        <CheckCircle2 className="mr-2 h-4 w-4" />
      )}
      
      {/* Button content */}
      {children}
      
      {/* Loading progress bar */}
      {isLoading && (
        <span
          className="absolute bottom-0 left-0 h-1 bg-primary-300 transition-all duration-300"
          style={{
            width: '100%',
            opacity: 1,
          }}
        />
      )}
    </Button>
  );
}