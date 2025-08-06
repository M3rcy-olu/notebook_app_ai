
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, Briefcase, GraduationCap, Palette, Folder, Plus } from "lucide-react";

// EditableNotebookItem component for inline editing
function EditableNotebookItem({ 
  initialValue, 
  onSave, 
  onCancel, 
  className = "" 
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end of text
      const length = value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSave = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onSave(trimmedValue);
    } else {
      onCancel();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center px-4 py-2">
        <Folder className="w-4 h-4 mr-3 text-gray-600 dark:text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="bg-transparent border-none outline-none flex-1 text-sm text-gray-900 dark:text-gray-100"
          placeholder="Enter notebook name"
        />
      </div>
    </div>
  );
}

const defaultNotebooks = {
  personal: { icon: Book, label: "Personal", color: "text-emerald-600 dark:text-emerald-400", isDefault: true },
  work: { icon: Briefcase, label: "Work", color: "text-green-600 dark:text-green-400", isDefault: true },
  study: { icon: GraduationCap, label: "Study", color: "text-teal-600 dark:text-teal-400", isDefault: true },
  creative: { icon: Palette, label: "Creative", color: "text-lime-600 dark:text-lime-400", isDefault: true },
  other: { icon: Folder, label: "Other", color: "text-gray-600 dark:text-gray-400", isDefault: true }
};

export default function NotebookFilter({ 
  selectedNotebook, 
  onNotebookChange, 
  notebookCounts, 
  notebooks = Object.keys(defaultNotebooks),
  onAddNotebook,
  isAddingNotebook = false,
  onNotebookNameChange = () => {},
  onNotebookSave = () => {},
  onNotebookCancel = () => {},
  onDeleteNotebook = () => {}
}) {
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    notebookId: null 
  });
  const totalNotes = Object.values(notebookCounts).reduce((sum, count) => sum + count, 0);
  
  // Create notebook config with default values for known notebooks
  const notebookConfig = {};
  notebooks.forEach(notebook => {
    notebookConfig[notebook] = defaultNotebooks[notebook] || {
      icon: Folder,
      label: notebook.charAt(0).toUpperCase() + notebook.slice(1).replace(/-/g, ' '),
      color: "text-gray-600 dark:text-gray-400"
    };
  });

  const handleContextMenu = (e, notebookId, isDefault) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't show context menu for default notebooks or 'all' selection
    if (isDefault || notebookId === 'all') return;
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      notebookId
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!contextMenu.visible) return;
    
    const handleClickOutside = () => closeContextMenu();
    
    // Add a small delay to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', closeContextMenu);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', closeContextMenu);
    };
  }, [contextMenu.visible, closeContextMenu]);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (contextMenu.notebookId) {
      closeContextMenu();
      // Small delay to ensure the context menu is closed before showing the delete confirmation
      setTimeout(() => {
        onDeleteNotebook(contextMenu.notebookId);
      }, 10);
    }
  };

  return (
    <div className="space-y-4" onClick={closeContextMenu}>
      <div>
        <h3 className="font-semibold mb-3 text-lg" style={{ color: 'var(--text-primary)' }}>Notebooks</h3>
        <div className="space-y-1">
          <Button
            variant={selectedNotebook === "all" ? "default" : "ghost"}
            className={`w-full justify-start text-left smooth-transition ${
              selectedNotebook === "all" 
                ? 'earthy-green-gradient text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onNotebookChange("all")}
          >
            <Folder className="w-4 h-4 mr-3" />
            <span className="flex-1">All Notes</span>
            <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {totalNotes}
            </Badge>
          </Button>
          
          {Object.entries(notebookConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = notebookCounts[key] || 0;
            const isDefaultNotebook = config.isDefault || false;
            
            return (
              <div 
                key={key} 
                className="relative"
                onContextMenu={(e) => handleContextMenu(e, key, isDefaultNotebook)}
              >
                <Button
                  variant={selectedNotebook === key ? "default" : "ghost"}
                  className={`w-full justify-start text-left smooth-transition ${
                    selectedNotebook === key 
                      ? 'earthy-green-gradient text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onNotebookChange(key)}
                >
                  <Icon className={`w-4 h-4 mr-3 ${selectedNotebook === key ? 'text-white' : config.color}`} />
                  <span className="flex-1 capitalize">{config.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {count}
                    </Badge>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Add Notebook Button and Input */}
        <div className="mt-4">
          {isAddingNotebook ? (
            <div className="px-2 py-1">
              <input
                type="text"
                autoFocus
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter notebook name"
                onBlur={onNotebookSave}
                onChange={(e) => onNotebookNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNotebookSave();
                  if (e.key === 'Escape') onNotebookCancel();
                }}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={onAddNotebook}
            >
              <Plus className="w-4 h-4 mr-3" />
              <span>Add Notebook</span>
            </Button>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-48"
          style={{
            top: `${Math.min(contextMenu.y, window.innerHeight - 100)}px`,
            left: `${Math.min(contextMenu.x, window.innerWidth - 200)}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
            onClick={handleDeleteClick}
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Delete Notebook
          </button>
        </div>
      )}
    </div>
  );
}
