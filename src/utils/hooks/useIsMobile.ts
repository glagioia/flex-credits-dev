import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../breakpoints';

/**
 * Hook to detect if the current viewport is mobile
 * Uses the 'md' breakpoint (768px) as the threshold
 * 
 * @returns boolean - true if viewport width is less than md breakpoint
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Initial value based on window width (SSR safe)
    if (typeof window !== 'undefined') {
      return window.innerWidth < BREAKPOINTS.md;
    }
    return false;
  });

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };

    // Check on mount
    checkIsMobile();

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

export default useIsMobile;
