
import React, { useState, useEffect } from "react";
import { Note } from "@/entities/Note";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Grid, List, Book, Palette, Settings, Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import NoteCard from "@/components/notes/NoteCard";
import NotebookFilter from "@/components/notes/NotebookFilter";
import { ContextMenu } from "@/components/notes/ContextMenu";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotebook, setSelectedNotebook] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or system preference
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      return savedMode === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Effect to apply/remove 'dark' class on the document's root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const fetchedNotes = await Note.list("-last_modified");
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleDeleteNote = async (noteId) => {
    try {
      await Note.delete(noteId);
      await loadNotes(); // Ensure the list is refreshed before proceeding
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete the note. Please try again.");
    }
  };

  const handleNewNote = () => {
    // Pass the selected notebook as a URL parameter
    navigate(createPageUrl("Canvas") + `?notebook=${selectedNotebook === 'all' ? 'personal' : selectedNotebook}`);
  };

  const handleDownloadNotes = () => {
    setSelectionMode(true);
  };

  const handleNoteSelect = (noteId, isSelected) => {
    setSelectedNotes(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(noteId);
      } else {
        newSelection.delete(noteId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === filteredNotes.length) {
      // If all are selected, deselect all
      setSelectedNotes(new Set());
    } else {
      // Otherwise select all visible notes
      const allNoteIds = new Set(filteredNotes.map(note => note.id));
      setSelectedNotes(allNoteIds);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedNotes(new Set());
  };

  const handleDownloadSelected = () => {
    console.log('Downloading notes:', Array.from(selectedNotes));
    // TODO: Implement actual download functionality
    setSelectionMode(false);
    setSelectedNotes(new Set());
  };

  // Load notebooks from localStorage or use default ones
  const [notebooks, setNotebooks] = useState(() => {
    const savedNotebooks = localStorage.getItem('notability-notebooks');
    return savedNotebooks ? JSON.parse(savedNotebooks) : ["personal", "work", "study", "creative", "other"];
  });
  const [isAddingNotebook, setIsAddingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  
  // Save notebooks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notability-notebooks', JSON.stringify(notebooks));
  }, [notebooks]);

  const startAddingNotebook = () => {
    setIsAddingNotebook(true);
    setNewNotebookName('New Notebook');
  };

  const handleAddNotebook = () => {
    const name = newNotebookName.trim();
    if (!name) {
      setIsAddingNotebook(false);
      return;
    }
    
    const notebookKey = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if notebook already exists
    if (notebooks.includes(notebookKey)) {
      // Just cancel the addition if it already exists
      setIsAddingNotebook(false);
      return;
    }
    
    // Add the new notebook to the list
    setNotebooks(prev => [...prev, notebookKey]);
    setNewNotebookName('');
    setIsAddingNotebook(false);
    
    // Select the new notebook
    setSelectedNotebook(notebookKey);
  };

  const cancelAddNotebook = () => {
    setIsAddingNotebook(false);
    setNewNotebookName('');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNotebook = selectedNotebook === "all" || note.notebook === selectedNotebook;
    return matchesSearch && matchesNotebook;
  });

  const notebookCounts = notes.reduce((acc, note) => {
    acc[note.notebook] = (acc[note.notebook] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="glass-effect border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 earthy-green-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Book className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notes</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 glass-effect border-0 smooth-transition focus:shadow-lg"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          
          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 glass-effect rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`px-3 ${viewMode === "grid" ? 'earthy-green-gradient text-white' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`px-3 ${viewMode === "list" ? 'earthy-green-gradient text-white' : ''}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Dark Mode Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(prev => !prev)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          {/* Action Buttons */}
          {selectionMode ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {selectedNotes.size} selected
              </span>
              <Button 
                variant="outline"
                onClick={handleSelectAll}
                className="border-gray-300 dark:border-gray-600"
              >
                {selectedNotes.size === filteredNotes.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancelSelection}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDownloadSelected}
                className="earthy-green-gradient text-white shadow-lg"
                disabled={selectedNotes.size === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download ({selectedNotes.size})
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleNewNote}
              className="earthy-green-gradient text-white shadow-lg floating-element border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 glass-effect border-r p-4" style={{ borderColor: 'var(--border-color)' }}>
          <NotebookFilter
            selectedNotebook={selectedNotebook}
            onNotebookChange={setSelectedNotebook}
            notebookCounts={notebookCounts}
            notebooks={notebooks}
            isAddingNotebook={isAddingNotebook}
            onAddNotebook={startAddingNotebook}
            onNotebookNameChange={setNewNotebookName}
            onNotebookSave={handleAddNotebook}
            onNotebookCancel={cancelAddNotebook}
          />
        </div>

        {/* Main Content */}
        <div 
          className="flex-1 overflow-auto p-6" 
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <ContextMenu 
            onNewNote={handleNewNote}
            onDownloadNotes={handleDownloadNotes}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[3/4] glass-effect rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 light-green-bg rounded-full flex items-center justify-center mb-6">
                  <Palette className="w-12 h-12" style={{ color: 'var(--primary-green)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {searchTerm || selectedNotebook !== "all" ? "No notes found" : "Start creating"}
                </h3>
                <p className="text-center mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                  {searchTerm || selectedNotebook !== "all" 
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Create your first note and start expressing your ideas with digital ink."
                  }
                </p>
                <Button 
                  onClick={handleNewNote}
                  className="earthy-green-gradient text-white shadow-lg floating-element"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "space-y-4"
              }>
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onDelete={handleDeleteNote}
                    isSelectable={selectionMode}
                    isSelected={selectedNotes.has(note.id)}
                    onSelect={handleNoteSelect}
                  />
                ))}
              </div>
            )}
          </ContextMenu>
      </div>
    </div>
  </div>
  );
}
