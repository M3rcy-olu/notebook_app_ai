
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notebookColors = {
  personal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  work: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", 
  study: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  creative: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300"
};

export default function NoteCard({ note, viewMode, onDelete }) {
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Delete button clicked for note:', note.id); // Debug log

    // A small delay helps ensure the dropdown has time to process the click
    // before the confirmation dialog pops up, preventing weird UI behavior.
    await new Promise(resolve => setTimeout(resolve, 50));

    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        console.log('Attempting to delete note:', note.id); // Debug log
        await onDelete(note.id);
        console.log('Note deleted successfully'); // Debug log
      } catch (error) {
        console.error('Error during note deletion:', error);
        alert('Failed to delete the note. Please try again.');
      }
    }
  };

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on dropdown or its children
    if (e.target.closest('[data-dropdown]')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (viewMode === "list") {
    return (
      <Link to={createPageUrl("Canvas") + `?id=${note.id}`} onClick={handleCardClick}>
        <div className="glass-effect rounded-2xl p-4 floating-element smooth-transition group">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 light-green-bg rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {note.thumbnail ? (
                <img 
                  src={note.thumbnail} 
                  alt={note.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 earthy-green-gradient rounded-lg"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-lg" style={{ color: 'var(--text-primary)' }}>{note.title}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(note.last_modified || note.created_date), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={notebookColors[note.notebook]}>
                {note.notebook}
              </Badge>
              
              <div data-dropdown>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-100 group-hover:opacity-100 smooth-transition"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[120px] z-[1000]">
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        console.log('onSelect prop called in NoteCard (list view)'); // Debug log
                        handleDelete(e);
                      }}
                      className="text-black-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }
  else {
    return (
      <Link to={createPageUrl("Canvas") + `?id=${note.id}`} onClick={handleCardClick}>
        <div className="glass-effect rounded-2xl overflow-hidden floating-element smooth-transition group aspect-[3/4] flex flex-col">
          <div className="flex-1 light-green-bg flex items-center justify-center overflow-hidden">
            {note.thumbnail ? (
              <img 
                src={note.thumbnail} 
                alt={note.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 earthy-green-gradient rounded-2xl"></div>
            )}
          </div>
          
          <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold truncate flex-1 text-lg" style={{ color: 'var(--text-primary)' }}>{note.title}</h3>
              <div data-dropdown>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-100 group-hover:opacity-100 smooth-transition -mt-1"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[120px] z-[1000]">
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        console.log('onSelect prop called in NoteCard (grid view)'); // Debug log
                        handleDelete(e);
                      }}
                      className="text-black-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {format(new Date(note.last_modified || note.created_date), 'MMM d, yyyy')}
              </p>
              <Badge className={notebookColors[note.notebook]}>
                {note.notebook}
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    );
  }
}
