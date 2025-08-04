import React from 'react';

export function Badge({ children, className = '', variant = 'default', ...rest }) {
  const variants = {
    default: 'bg-green-100 text-green-800',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`} {...rest}>
      {children}
    </span>
  );
}
