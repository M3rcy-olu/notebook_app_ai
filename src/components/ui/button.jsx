import React from 'react';
import clsx from 'clsx';

export function Button({
  children,
  className = '',
  variant = 'default',
  ...rest
}) {
  const base = 'inline-flex items-center px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  const variants = {
    default: 'bg-primary-600 text-white hover:bg-primary-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
