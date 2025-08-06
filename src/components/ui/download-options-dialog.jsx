import React from 'react';
import { Download, FileArchive, File, X } from 'lucide-react';
import { Button } from './button';

export function DownloadOptionsDialog({ 
  isOpen, 
  onClose, 
  onDownloadSeparate,
  onDownloadZip,
  selectedCount = 0
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

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
            <div className="w-10 h-10 light-green-bg rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Download Options
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
          Download {selectedCount} selected {selectedCount === 1 ? 'note' : 'notes'} as:
        </p>

        {/* Download Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onDownloadSeparate}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Separate Files</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Download each note as an individual file
              </div>
            </div>
          </button>
          
          <button
            onClick={onDownloadZip}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileArchive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>ZIP Archive</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Download all notes in a single ZIP file
              </div>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="px-4 py-2"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
