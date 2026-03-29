import React, { ReactNode } from 'react';

/**
 * Reusable Badge component
 * Displays status, category, or tag information
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'premium' | 'new' | 'hot' | 'verified' | 'sold' | 'rera' | 'default';
  children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'badge';
  const variantClasses = variant !== 'default' ? `badge-${variant}` : '';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

Badge.displayName = 'Badge';
