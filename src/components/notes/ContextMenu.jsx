import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, BookOpen, X } from 'lucide-react';

export function ContextMenu({ onNewNote, onNewNotebook, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  const handleContextMenu = useCallback((e) => {
    // Only open the context menu if the user right-clicks on the container background
    // and not on a note card or other interactive element.
    if (e.target === containerRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      const x = e.clientX;
      const y = e.clientY;
      
      const menuWidth = 200; 
      const menuHeight = 120;
      
      const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
      const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;
      
      setPosition({ x: adjustedX, y: adjustedY });
      setIsOpen(true);
    }
  }, []);

  const handleClick = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  const handleGlobalContextMenu = useCallback((e) => {
    if (isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleGlobalContextMenu);

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, [handleClick, handleContextMenu, handleGlobalContextMenu]);

  const handleNewNoteClick = (e) => {
    e.stopPropagation();
    onNewNote?.();
    setIsOpen(false);
  };

  const handleNewNotebookClick = (e) => {
    e.stopPropagation();
    if (onNewNotebook) {
      onNewNotebook();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {children}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-100 ease-out"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <button
              onClick={handleNewNoteClick}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
            
          </div>
            <div className="py-1">
              <button
                onClick={handleNewNotebookClick}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <BookOpen className="w-4 h-4" />
                <span>New Notebook</span>
              </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default ContextMenu;
