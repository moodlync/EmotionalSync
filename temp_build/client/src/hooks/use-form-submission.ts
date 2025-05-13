import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UseFormReturn, FieldValues, SubmitHandler, SubmitErrorHandler } from 'react-hook-form';
import { useInteractiveAction } from '@/hooks/use-interactive-action';

interface FormSubmissionOptions<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  onError?: SubmitErrorHandler<TFieldValues>;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  retryCount?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  resetFormOnSuccess?: boolean;
  scrollToErrors?: boolean;
}

interface FormSubmissionReturn<TFieldValues extends FieldValues> {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Custom hook for handling form submissions with built-in loading states,
 * error handling, and auto-retry functionality.
 */
export function useFormSubmission<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  onError,
  successMessage,
  errorMessage = "Couldn't submit the form. Please check your information and try again.",
  loadingMessage = "Submitting...",
  retryCount = 1,
  retryDelay = 1000,
  autoRetry = true,
  resetFormOnSuccess = false,
  scrollToErrors = true,
}: FormSubmissionOptions<TFieldValues>): FormSubmissionReturn<TFieldValues> {
  const { toast } = useToast();
  const [formError, setFormError] = useState<Error | null>(null);
  
  // Setup the interactive action for form submission
  const {
    execute,
    isLoading: isSubmitting,
    error,
    isSuccess,
    reset: resetAction,
  } = useInteractiveAction({
    actionFn: async () => {
      try {
        // Execute the form validation and submission
        return await form.handleSubmit(
          // On valid submission
          async (data) => {
            try {
              // Execute the onSubmit callback
              const result = await onSubmit(data);
              
              // Reset the form if configured
              if (resetFormOnSuccess) {
                form.reset();
              }
              
              return result;
            } catch (err) {
              console.error('Form submission error:', err);
              throw err;
            }
          },
          // On validation error
          (errors) => {
            console.log('Form validation errors:', errors);
            
            // Call the onError callback if provided
            if (onError) {
              onError(errors);
            }
            
            // Scroll to the first error if configured
            if (scrollToErrors) {
              // Find the first error field
              const firstErrorField = Object.keys(errors)[0];
              if (firstErrorField) {
                // Find the field element
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (errorElement) {
                  // Scroll to the field
                  errorElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }
              }
            }
            
            // Show error toast
            toast({
              title: "Form Validation Failed",
              description: "Please check the highlighted fields and try again.",
              variant: "destructive",
            });
            
            // For validation errors, we don't want to retry
            throw new Error('Form validation failed');
          },
        )();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setFormError(error);
        throw error;
      }
    },
    successMessage,
    errorMessage,
    loadingMessage,
    retryCount: autoRetry ? retryCount : 0,
    retryDelay,
    isRetrySafe: autoRetry,
  });
  
  // Reset the form submission state
  const reset = useCallback(() => {
    resetAction();
    setFormError(null);
  }, [resetAction]);
  
  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      if (e) {
        e.preventDefault();
      }
      
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
        
        // Execute the form submission
        await execute();
      } catch (err) {
        console.error('Form submission handling error:', err);
      }
    },
    [execute, toast],
  );
  
  return {
    handleSubmit,
    isSubmitting,
    isSuccess,
    error: error || formError,
    reset,
  };
}