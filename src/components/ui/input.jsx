import React from 'react';

export function Input({ className = '', ...rest }) {
  return (
    <input
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 ${className}`}
      {...rest}
    />
  );
}
