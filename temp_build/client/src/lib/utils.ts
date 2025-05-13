import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date object into a readable date string
 * @param date The date to format
 * @returns A string in the format "Month DD, YYYY"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Format a date object into a readable date and time string
 * @param date The date to format
 * @returns A string in the format "Month DD, YYYY at HH:MM AM/PM"
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every limit milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Checks if a value is null or undefined.
 */
export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * Safely adds a CSS class to an HTML element with a check if the element exists
 */
export function addClassSafely(element: HTMLElement | null, className: string): void {
  if (element && !element.classList.contains(className)) {
    element.classList.add(className);
  }
}

/**
 * Safely removes a CSS class from an HTML element with a check if the element exists
 */
export function removeClassSafely(element: HTMLElement | null, className: string): void {
  if (element && element.classList.contains(className)) {
    element.classList.remove(className);
  }
}

/**
 * Creates a promise that resolves after the specified amount of time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
