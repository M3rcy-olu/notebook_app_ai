
import React, { useState, useRef, useEffect } from "react";
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
  personal: { icon: Book, label: "Personal", color: "text-emerald-600 dark:text-emerald-400" },
  work: { icon: Briefcase, label: "Work", color: "text-green-600 dark:text-green-400" },
  study: { icon: GraduationCap, label: "Study", color: "text-teal-600 dark:text-teal-400" },
  creative: { icon: Palette, label: "Creative", color: "text-lime-600 dark:text-lime-400" },
  other: { icon: Folder, label: "Other", color: "text-gray-600 dark:text-gray-400" }
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
  onNotebookCancel = () => {}
}) {
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

  return (
    <div className="space-y-4">
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
            
            return (
              <Button
                key={key}
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
    </div>
  );
}
