
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Slider from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
// Import icons from lucide-react
import { 
  Pen,        // Drawing pen tool
  Highlighter, // Highlighter tool
  Eraser,     // Eraser tool
  Hand,       // Pan/Hand tool
  Palette,    // Color palette icon
  Plus,       // Add/Plus icon
  X,          // Close/Delete icon
  Save        // Save icon
} from "lucide-react";

// Define available drawing tools with their icons and labels
const tools = [
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'pan', icon: Hand, label: 'Pan' }
];

// Define color palette options
const colors = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#ca8a04', // yellow
  '#9333ea', // purple
  '#ea580c', // orange
  '#0891b2', // cyan
  '#be123c', // rose
  '#374151', // gray
  '#000000'  // black
];

/**
 * ToolPalette Component
 * 
 * @param {string} currentTool - Currently selected tool (pen, highlighter, eraser, pan)
 * @param {string} currentColor - Currently selected color in hex format
 * @param {number} currentSize - Currently selected brush size in pixels
 * @param {function} onToolChange - Callback when tool is changed
 * @param {function} onColorChange - Callback when color is changed
 * @param {function} onSizeChange - Callback when brush size is changed
 */
export default function ToolPalette({ 
  currentTool, 
  currentColor, 
  currentSize,
  onToolChange,
  onColorChange,
  onSizeChange
}) {
  // State for saved and recently used pen presets
  const [savedPens, setSavedPens] = useState([]);
  const [recentPens, setRecentPens] = useState([]);

  // Load saved and recent pens from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem('notability-saved-pens');
    const recent = localStorage.getItem('notability-recent-pens');
    
    if (saved) {
      setSavedPens(JSON.parse(saved));
    }
    if (recent) {
      setRecentPens(JSON.parse(recent));
    }
  }, []);

  // Update recent pens whenever tool, color, or size changes
  useEffect(() => {
    if (currentTool === 'pen' || currentTool === 'highlighter') {
      updateRecentPens();
    }
  }, [currentTool, currentColor]);

  /**
   * Updates the list of recently used pens
   * Adds current pen settings to recent pens if they're different
   */
  const updateRecentPens = () => {
    const newPen = {
      id: Date.now(),
      tool: currentTool,
      color: currentColor,
      size: currentSize
    };

    setRecentPens(prev => {
      // Remove duplicate pen if it already exists with same settings
      const filtered = prev.filter(pen => 
        !(pen.tool === newPen.tool && pen.color === newPen.color && pen.size === newPen.size)
      );
      
      // Add new pen to beginning and limit to 6 recent pens
      const updated = [newPen, ...filtered].slice(0, 3);
      localStorage.setItem('notability-recent-pens', JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Saves the current pen settings to saved pens
   * Only works for pen and highlighter tools
   */
  const savePen = () => {
    if (currentTool === 'pen' || currentTool === 'highlighter') {
      const newPen = {
        id: Date.now(),
        tool: currentTool,
        color: currentColor,
        size: currentSize,
        name: `${currentTool} ${currentSize}px`
      };

      setSavedPens(prev => {
        const updated = [...prev, newPen].slice(0, 12); // Limit to 12 saved pens
        localStorage.setItem('notability-saved-pens', JSON.stringify(updated));
        return updated;
      });
    }
  };

  /**
   * Deletes a saved pen preset by ID
   * @param {number} penId - ID of the pen to delete
   */
  const deleteSavedPen = (penId) => {
    setSavedPens(prev => {
      const updated = prev.filter(pen => pen.id !== penId);
      localStorage.setItem('notability-saved-pens', JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Handles selection of a pen preset
   * Updates the current tool, color, and size
   * @param {Object} pen - The pen preset to select
   */
  const selectPen = (pen) => {
    onToolChange(pen.tool);
    onColorChange(pen.color);
    onSizeChange(pen.size);
  };

  // Main render function
  return (
    // Fixed position container for the tool palette
    <div className="fixed top-20 left-6 bottom-6 w-80 z-40 flex flex-col">
      {/* Glass-effect container with scrollable content */}
      <div className="glass-effect rounded-2xl p-6 floating-element flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Tools Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Tools</h3>
            {/* Grid layout for tool buttons */}
            <div className="grid grid-cols-2 gap-2">
              {tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={currentTool === tool.id ? "default" : "ghost"}
                    className={`h-12 flex-col gap-1 smooth-transition ${
                      currentTool === tool.id 
                        ? 'earthy-green-gradient text-white' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => onToolChange(tool.id)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Recent Pens Section - Only shown for pen/highlighter tools */}
          {recentPens.length > 0 && (currentTool === 'pen' || currentTool === 'highlighter') && (
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Recent</h4>
              <div className="grid grid-cols-3 gap-2">
                {recentPens.map(pen => (
                  <button
                    key={pen.id}
                    className="group relative w-16 h-16 rounded-xl border-2 hover:border-green-300 dark:hover:border-green-600 smooth-transition flex items-center justify-center glass-effect"
                    style={{ borderColor: 'var(--border-color)' }}
                    onClick={() => selectPen(pen)}
                    aria-label={`Select ${pen.tool} (${pen.size}px)`}
                  >
                    {/* Pen color preview */}
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ 
                        backgroundColor: pen.color,
                        borderColor: 'var(--border-color)'
                      }}
                    />
                    {/* Size indicator */}
                    <div className="absolute -bottom-1 -right-1 bg-gray-100 dark:bg-gray-700 text-xs rounded px-1" style={{ color: 'var(--text-secondary)' }}>
                      {pen.size}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Pens Section - Shows all saved pen presets */}
          {savedPens.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium" style={{ color: 'var(--text-secondary)' }}>Saved Pens</h4>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {savedPens.map(pen => (
                  <div key={pen.id} className="relative group">
                    {/* Pen preset button */}
                    <button
                      className="w-16 h-16 rounded-xl border-2 hover:border-green-300 dark:hover:border-green-600 smooth-transition flex items-center justify-center glass-effect"
                      style={{ borderColor: 'var(--border-color)' }}
                      onClick={() => selectPen(pen)}
                      aria-label={`Select saved ${pen.tool} (${pen.size}px)`}
                    >
                      {/* Pen color preview */}
                      <div
                        className="w-8 h-8 rounded-full border"
                        style={{ 
                          backgroundColor: pen.color,
                          borderColor: 'var(--border-color)'
                        }}
                      />
                      {/* Size indicator */}
                      <div className="absolute -bottom-1 -right-1 bg-gray-100 dark:bg-gray-700 text-xs rounded px-1" style={{ color: 'var(--text-secondary)' }}>
                        {pen.size}
                      </div>
                    </button>
                    {/* Delete button (appears on hover) */}
                    <button
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 smooth-transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedPen(pen.id);
                      }}
                      aria-label={`Delete ${pen.tool} preset`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Picker Section - Hidden for eraser and pan tools */}
          {currentTool !== 'eraser' && currentTool !== 'pan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Color</span>
                </div>
                {/* Save button - Only shown for pen and highlighter tools */}
                {(currentTool === 'pen' || currentTool === 'highlighter') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={savePen}
                    className="h-7 px-2 text-xs earthy-green-gradient text-white hover:opacity-90"
                    aria-label="Save current pen settings"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                )}
              </div>
              {/* Color grid */}
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-xl border-2 smooth-transition hover:scale-105 ${
                      currentColor === color 
                        ? 'border-green-400 dark:border-green-500 scale-110' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Controls Section - Hidden for pan tool */}
          {currentTool !== 'pan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Size</span>
                {/* Size input field */}
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={currentTool === 'highlighter' ? 30 : 20}
                    value={currentSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        const max = currentTool === 'highlighter' ? 30 : 20;
                        const clampedValue = Math.max(1, Math.min(value, max));
                        onSizeChange(clampedValue);
                      }
                    }}
                    className="w-16 text-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs"></span>
                </div>
              </div>
              <div className="space-y-3">
                {/* Size slider */}
                <div className="px-2">
                  <Slider
                    value={currentSize}
                    onValueChange={(values) => {
                      if (values && values[0] !== undefined) {
                        onSizeChange(values[0]);
                      }
                    }}
                    min={1}
                    max={currentTool === 'highlighter' ? 30 : 20}
                    step={1}
                    className="w-full"
                    aria-label="Brush size"
                  />
                </div>
                {/* Visual size preview */}
                <div className="flex justify-center">
                  <div
                    className="rounded-full border"
                    style={{
                      // Calculate preview size (2x actual size, capped at 40px)
                      width: Math.max(8, Math.min(currentSize * 2, 40)),
                      height: Math.max(8, Math.min(currentSize * 2, 40)),
                      // Show eraser color or current pen color
                      backgroundColor: currentTool === 'eraser' ? '#f3f4f6' : currentColor,
                      // Apply transparency for highlighter
                      opacity: currentTool === 'highlighter' ? 0.6 : 1,
                      borderColor: 'var(--border-color)'
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
