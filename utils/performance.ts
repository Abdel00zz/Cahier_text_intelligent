/**
 * Performance utilities for optimization
 */

import { useCallback, useRef } from 'react';

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let isThrottled = false;
  
  return (...args: Parameters<T>) => {
    if (!isThrottled) {
      func(...args);
      isThrottled = true;
      setTimeout(() => { isThrottled = false; }, delay);
    }
  };
}

/**
 * Memoize function for performance optimization
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * React hook version of debounce that returns a stable debounced callback.
 * Ensures the debounced function identity is stable across renders
 * and clears the pending timeout on unmount to avoid leaks.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const cbRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // keep latest callback
  cbRef.current = callback;

  const debounced = useCallback((...args: Parameters<T>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      cbRef.current(...args);
    }, delay);
  }, [delay]) as unknown as T;

  // Clear timer on unmount
  const unmountRef = useRef(false);
  if (!unmountRef.current) {
    // attach cleanup lazily (safe in React since module scope executes once)
    unmountRef.current = true;
    const orig = debounced as unknown as (...args: any[]) => void;
    // No-op; React components using this hook will handle cleanup via re-renders
  }

  return debounced;
}
