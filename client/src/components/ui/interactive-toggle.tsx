import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Toggle, toggleVariants } from '@/components/ui/toggle';
import { useInteractiveToggle } from '@/hooks/use-interactive-toggle';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { VariantProps } from "class-variance-authority";

// Define proper types for Switch and Toggle
type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>;
type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & 
  VariantProps<typeof toggleVariants>;

// Type to support both Switch and Toggle props
type ToggleComponent = 'switch' | 'toggle';

interface InteractiveToggleBaseProps {
  /** The initial state of the toggle */
  defaultChecked?: boolean;
  
  /** Controlled checked state */
  checked?: boolean;
  
  /** Function called when the toggle changes */
  onCheckedChange?: (checked: boolean) => Promise<void> | void;
  
  /** Message to show when toggling is successful */
  successMessage?: string;
  
  /** Message to show when toggling fails */
  errorMessage?: string;
  
  /** Message to show while toggling is in progress */
  loadingMessage?: string;
  
  /** Whether to retry failed toggling automatically */
  autoRetry?: boolean;
  
  /** Number of times to retry toggle operation */
  retryCount?: number;
  
  /** Delay in ms between retries */
  retryDelay?: number;
  
  /** Whether to show success/error states visually */
  showStateIndicator?: boolean;
  
  /** Duration in ms to show success/error state */
  stateIndicatorDuration?: number;
  
  /** Which toggle component to use (switch or toggle) */
  component?: ToggleComponent;
}

export type InteractiveSwitchProps = InteractiveToggleBaseProps & Omit<SwitchProps, 'onCheckedChange' | 'defaultChecked' | 'checked'>;
export type InteractiveToggleButtonProps = InteractiveToggleBaseProps & Omit<ToggleProps, 'onPressedChange' | 'defaultPressed' | 'pressed'>;

export type InteractiveToggleProps = InteractiveSwitchProps | InteractiveToggleButtonProps;

/**
 * Enhanced toggle component with built-in loading state, success/error animations,
 * error handling, and retry functionality.
 */
export function InteractiveToggle({
  defaultChecked = false,
  checked,
  onCheckedChange,
  successMessage,
  errorMessage = "Couldn't update the setting. Please try again.",
  loadingMessage = "Updating...",
  autoRetry = true,
  retryCount = 2,
  retryDelay = 1000,
  showStateIndicator = true,
  stateIndicatorDuration = 1500,
  component = 'switch',
  className,
  disabled,
  ...props
}: InteractiveToggleProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  
  // Use the interactive toggle hook
  const {
    value,
    toggle,
    setValue,
    isLoading,
    error
  } = useInteractiveToggle({
    initialValue: checked !== undefined ? checked : defaultChecked,
    onToggle: onCheckedChange,
    successMessage,
    errorMessage,
    loadingMessage,
    retryCount,
    retryDelay,
    autoRetry,
    onError: () => {
      // Show error state if enabled
      if (showStateIndicator) {
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, stateIndicatorDuration);
      }
    },
  });
  
  // Update controlled value when it changes externally
  React.useEffect(() => {
    if (checked !== undefined && checked !== value) {
      setValue(checked);
    }
  }, [checked, setValue, value]);
  
  // Handle toggle change
  const handleToggle = async () => {
    try {
      await toggle();
      
      // Show success state if enabled
      if (showStateIndicator) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, stateIndicatorDuration);
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };
  
  // Render the appropriate toggle component
  if (component === 'switch') {
    return (
      <div className="relative">
        <Switch
          checked={value}
          onCheckedChange={handleToggle}
          disabled={disabled || isLoading}
          className={cn(
            showSuccess && 'bg-green-500',
            showError && 'bg-red-500',
            isLoading && 'opacity-70 cursor-wait',
            className
          )}
          {...(props as SwitchProps)}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <Loader2 className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        
        {/* Success indicator */}
        {showSuccess && !isLoading && (
          <CheckCircle2 className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        
        {/* Error indicator */}
        {showError && !isLoading && (
          <XCircle className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
    );
  } else {
    return (
      <div className="relative">
        <Toggle
          pressed={value}
          onPressedChange={handleToggle}
          disabled={disabled || isLoading}
          className={cn(
            showSuccess && 'bg-green-500 text-white',
            showError && 'bg-red-500 text-white',
            isLoading && 'opacity-70 cursor-wait',
            className
          )}
          {...(props as ToggleProps)}
        >
          {props.children}
          
          {/* Loading indicator */}
          {isLoading && (
            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
          )}
        </Toggle>
        
        {/* Success indicator */}
        {showSuccess && !isLoading && !props.children && (
          <CheckCircle2 className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        
        {/* Error indicator */}
        {showError && !isLoading && !props.children && (
          <XCircle className="absolute -right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
    );
  }
}