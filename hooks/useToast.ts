'use client';

import { useState, useCallback } from 'react';

export interface UseToastReturn {
  showToast: (message: string, icon?: string, duration?: number) => void;
  hideToast: () => void;
}

export const useToast = (): UseToastReturn => {
  const [, setToast] = useState<{ message: string; icon: string } | null>(null);

  const showToast = useCallback(
    (message: string, icon = '✓', duration = 3000) => {
      setToast({ message, icon });
      setTimeout(() => setToast(null), duration);
    },
    []
  );

  const hideToast = useCallback(() => setToast(null), []);

  return { showToast, hideToast };
};
