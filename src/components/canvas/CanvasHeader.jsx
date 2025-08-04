
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Undo, 
  Redo, 
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  Upload,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CanvasHeader({ 
  currentNote,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  scale,
  onScaleChange,
  onPdfUpload,
  onExportToDrive,
  isExporting,
  currentPage,
  totalPages,
  onPageChange
}) {
  const navigate = useNavigate();
  const [noteTitle, setNoteTitle] = useState(currentNote?.title || "Untitled Note");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    onSave(noteTitle);
  };

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    setIsEditingTitle(false);
    if (noteTitle.trim()) {
      handleSave();
    }
  };

  const resetZoom = () => {
    onScaleChange(1);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    try {
      await onPdfUpload(file);
    } catch (error) {
      console.error('Error uploading PDF:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-effect border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Notes"))}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 smooth-transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex-1">
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                className="text-xl font-semibold border-none glass-effect"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
                autoFocus
              />
            </form>
          ) : (
            <h1 
              className="text-xl font-semibold cursor-pointer hover:opacity-70 px-2 py-1 rounded smooth-transition"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setIsEditingTitle(true)}
            >
              {noteTitle}
            </h1>
          )}
          
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Unsaved changes
            </Badge>
          )}

          {/* PDF Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 glass-effect rounded-lg p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="w-8 h-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium px-2" style={{ color: 'var(--text-primary)' }}>
                {currentPage + 1} / {totalPages}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="w-8 h-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* PDF Upload */}
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="hidden"
            id="pdf-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('pdf-upload').click()}
            disabled={isUploading}
            className="glass-effect border-0 hover:shadow-lg smooth-transition"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>
        </div>

        {/* Export to Drive */}
        <Button
          variant="outline"
          onClick={onExportToDrive}
          disabled={isExporting}
          className="glass-effect border-0 hover:shadow-lg smooth-transition"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </>
          )}
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 glass-effect rounded-lg p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}
            className="w-8 h-8"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm font-medium min-w-12 text-center" style={{ color: 'var(--text-primary)' }}>
              {Math.round(scale * 100)}%
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onScaleChange(Math.min(5, scale + 0.1))}
            className="w-8 h-8"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            className="w-8 h-8"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 smooth-transition"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 smooth-transition"
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 smooth-transition"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="earthy-green-gradient text-white shadow-lg floating-element border-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
