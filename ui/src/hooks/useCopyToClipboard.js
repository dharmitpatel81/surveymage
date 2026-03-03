import { useState, useCallback } from 'react';

const COPIED_DURATION_MS = 2000;

/**
 * Hook for copying text to clipboard with "Copied!" feedback
 * @returns {[copy: (text: string) => Promise<boolean>, showCopied: boolean]}
 */
export function useCopyToClipboard() {
  const [showCopied, setShowCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), COPIED_DURATION_MS);
      return true;
    } catch {
      return false;
    }
  }, []);

  return [copy, showCopied];
}
