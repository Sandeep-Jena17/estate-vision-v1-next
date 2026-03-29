import React from 'react';

/**
 * Reusable Toast/Notification component
 * Displays temporary messages to the user
 */

export interface ToastProps {
  message: string;
  icon?: string;
  duration?: number;
}

export interface ToastContextType {
  show: (message: string, icon?: string, duration?: number) => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  icon = '✓',
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className="toast" style={{ animation: 'toastIn 0.3s ease' }}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  );
};

Toast.displayName = 'Toast';
