import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmVariant = "danger" // "danger" for delete actions, "default" for others
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const confirmButtonClass = confirmVariant === "danger" 
    ? "bg-red-600 hover:bg-red-700 text-white" 
    : "earthy-green-gradient text-white";

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative glass-effect rounded-2xl p-6 max-w-md w-full mx-4 floating-element">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              confirmVariant === "danger" 
                ? "bg-red-100 dark:bg-red-900/30" 
                : "light-green-bg"
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                confirmVariant === "danger" 
                  ? "text-red-600 dark:text-red-400" 
                  : "text-green-600 dark:text-green-400"
              }`} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`px-4 py-2 ${confirmButtonClass}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
} 