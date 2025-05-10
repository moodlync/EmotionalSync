import { toast } from '@/hooks/use-toast';

// Types of errors that we'll handle
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  SERVER = 'server',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

// Error categories for reporting and analytics
export enum ErrorCategory {
  USER_INPUT = 'user_input',
  INFRASTRUCTURE = 'infrastructure',
  SECURITY = 'security',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown',
}

// Interface for error data
export interface ErrorData {
  message: string;
  type: ErrorType;
  category: ErrorCategory;
  code?: string;
  details?: Record<string, any>;
  timestamp: number;
  path?: string;
  retryable: boolean;
}

// Error reporting service (would be implemented with a real service)
const reportError = (error: ErrorData) => {
  // In a real app, this would send the error to a service like Sentry, LogRocket, etc.
  console.error('[Error Report]', error);
};

// Map HTTP status codes to error types
const statusToErrorType = (status: number): ErrorType => {
  if (status >= 400 && status < 500) {
    if (status === 400) return ErrorType.VALIDATION;
    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.PERMISSION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 408) return ErrorType.TIMEOUT;
  }
  if (status >= 500) return ErrorType.SERVER;
  return ErrorType.UNKNOWN;
};

// Create user-friendly error messages based on error type
const getUserFriendlyMessage = (errorType: ErrorType, originalMessage?: string): string => {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return originalMessage || "There was an issue with the information provided. Please check and try again.";
    case ErrorType.NETWORK:
      return "We're having trouble connecting to our servers. Please check your internet connection.";
    case ErrorType.AUTHENTICATION:
      return "Your session has expired. Please sign in again.";
    case ErrorType.PERMISSION:
      return "You don't have permission to perform this action.";
    case ErrorType.SERVER:
      return "Our servers are experiencing issues. We're working on it.";
    case ErrorType.NOT_FOUND:
      return "The information you requested couldn't be found.";
    case ErrorType.TIMEOUT:
      return "The request timed out. Please try again.";
    case ErrorType.UNKNOWN:
    default:
      return "Something unexpected happened. Please try again.";
  }
};

// Determine if an error is retryable
const isErrorRetryable = (errorType: ErrorType): boolean => {
  return [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.SERVER,
  ].includes(errorType);
};

// Get error category for a specific error type (useful for analytics)
const getErrorCategory = (errorType: ErrorType): ErrorCategory => {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return ErrorCategory.USER_INPUT;
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
    case ErrorType.SERVER:
      return ErrorCategory.INFRASTRUCTURE;
    case ErrorType.AUTHENTICATION:
    case ErrorType.PERMISSION:
      return ErrorCategory.SECURITY;
    case ErrorType.NOT_FOUND:
      return ErrorCategory.BUSINESS_LOGIC;
    case ErrorType.UNKNOWN:
    default:
      return ErrorCategory.UNKNOWN;
  }
};

/**
 * Handle API/fetch response errors, return a structured error object
 */
export const handleResponseError = async (response: Response): Promise<ErrorData> => {
  let errorData: Partial<ErrorData> = {
    timestamp: Date.now(),
    path: response.url,
  };
  
  try {
    // Try to parse the response as JSON
    const data = await response.json();
    
    // If the response includes error information, use it
    if (data.error) {
      errorData.message = data.error.message || data.message || response.statusText;
      errorData.code = data.error.code || data.code;
      errorData.details = data.error.details || data.details;
    } else {
      errorData.message = data.message || response.statusText;
    }
  } catch (e) {
    // If we can't parse the response, use the status text
    errorData.message = response.statusText;
  }
  
  // Determine error type from status code
  const errorType = statusToErrorType(response.status);
  errorData.type = errorType;
  errorData.category = getErrorCategory(errorType);
  errorData.retryable = isErrorRetryable(errorType);
  
  // Create complete error data
  const completeErrorData: ErrorData = {
    message: errorData.message || "Unknown error",
    type: errorData.type || ErrorType.UNKNOWN,
    category: errorData.category || ErrorCategory.UNKNOWN,
    code: errorData.code,
    details: errorData.details,
    timestamp: errorData.timestamp || Date.now(),
    path: errorData.path,
    retryable: errorData.retryable ?? false,
  };
  
  // Report the error
  reportError(completeErrorData);
  
  return completeErrorData;
};

/**
 * Handle general JavaScript errors, return a structured error object
 */
export const handleError = (error: unknown): ErrorData => {
  // Determine error type
  let type = ErrorType.UNKNOWN;
  let message = "An unexpected error occurred";
  let details: Record<string, any> | undefined;
  
  if (error instanceof Error) {
    message = error.message;
    
    // Identify specific error types
    if (error.name === 'TypeError' || error.name === 'SyntaxError' || error.name === 'ReferenceError') {
      type = ErrorType.UNKNOWN;
    } else if (error.name === 'NetworkError' || error.message.includes('network') || error.message.includes('connection')) {
      type = ErrorType.NETWORK;
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      type = ErrorType.TIMEOUT;
    }
    
    // Include stack trace in development only
    if (process.env.NODE_ENV === 'development') {
      details = { stack: error.stack };
    }
  } else if (typeof error === 'string') {
    message = error;
    
    // Try to identify network errors in the message
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      type = ErrorType.NETWORK;
    }
  } else if (error && typeof error === 'object') {
    // Handle unknown object errors
    message = String(error);
    details = { error };
  }
  
  // Create error data
  const errorData: ErrorData = {
    message,
    type,
    category: getErrorCategory(type),
    timestamp: Date.now(),
    path: window.location.pathname,
    retryable: isErrorRetryable(type),
    details,
  };
  
  // Report the error
  reportError(errorData);
  
  return errorData;
};

/**
 * Show a toast notification for an error
 */
export const showErrorToast = (errorData: ErrorData): void => {
  toast({
    title: errorData.category === ErrorCategory.USER_INPUT ? "Please Check Your Information" : "Error",
    description: getUserFriendlyMessage(errorData.type, errorData.message),
    variant: "destructive",
  });
};

/**
 * Handle an error and show a toast notification
 */
export const handleErrorWithToast = (error: unknown): ErrorData => {
  const errorData = handleError(error);
  showErrorToast(errorData);
  return errorData;
};

/**
 * Handle a fetch response error and show a toast notification
 */
export const handleResponseErrorWithToast = async (response: Response): Promise<ErrorData> => {
  const errorData = await handleResponseError(response);
  showErrorToast(errorData);
  return errorData;
};

/**
 * Creates a safe function that catches any errors and handles them
 * @param fn The function to wrap
 * @param showToast Whether to show a toast notification on error
 * @returns A wrapped function that catches errors
 */
export function createSafeFunction<Args extends any[], Return>(
  fn: (...args: Args) => Return,
  showToast = true
): (...args: Args) => Return | undefined {
  return (...args: Args) => {
    try {
      return fn(...args);
    } catch (error) {
      if (showToast) {
        handleErrorWithToast(error);
      } else {
        handleError(error);
      }
      return undefined;
    }
  };
}

/**
 * Creates a safe async function that catches any errors and handles them
 * @param fn The async function to wrap
 * @param showToast Whether to show a toast notification on error
 * @returns A wrapped async function that catches errors
 */
export function createSafeAsyncFunction<Args extends any[], Return>(
  fn: (...args: Args) => Promise<Return>,
  showToast = true
): (...args: Args) => Promise<Return | undefined> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (showToast) {
        handleErrorWithToast(error);
      } else {
        handleError(error);
      }
      return undefined;
    }
  };
}