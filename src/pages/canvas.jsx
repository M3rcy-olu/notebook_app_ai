import React, { useState, useRef, useEffect } from "react";
import { Note } from "@/entities/Note";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Book } from "lucide-react";

import DrawingCanvas from "@/components/canvas/DrawingCanvas";
import ToolPalette from "@/components/canvas/ToolPalette";
import CanvasHeader from "@/components/canvas/CanvasHeader";

export default function Canvas() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Drawing state
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#2563eb");
  const [currentSize, setCurrentSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasData, setCanvasData] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Canvas transform state
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // PDF state
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Get notebook from URL parameters or use default
  const getNotebookFromUrl = () => {
    const urlParams = new URLSearchParams(location.search);
    const notebookParam = urlParams.get('notebook');
    // Only allow valid notebook names to prevent XSS
    const validNotebooks = ["personal", "work", "study", "creative", "other"];
    return notebookParam && validNotebooks.includes(notebookParam) 
      ? notebookParam 
      : "personal";
  };

  useEffect(() => {
    loadNote();
  }, [location.search]);

  const loadNote = async () => {
    const urlParams = new URLSearchParams(location.search);
    const noteId = urlParams.get('id');
    
    if (noteId) {
      try {
        const note = await Note.get(noteId);
        setCurrentNote(note);
        if (note.content) {
          const content = JSON.parse(note.content);
          setCanvasData(content);
        }
        if (note.pdf_pages && note.pdf_pages.length > 0) {
          setPdfPages(note.pdf_pages);
          setCurrentPage(note.current_page || 0);
          setBackgroundImage(note.pdf_pages[note.current_page || 0]);
        }
      } catch (error) {
        console.error("Error loading note:", error);
      }
    }
    setIsLoading(false);
  };

  const saveNote = async (title) => {
    if (!title.trim()) return;
    
    setIsSaving(true);
    try {
      const canvas = canvasRef.current?.canvas;
      const thumbnail = canvas ? canvas.toDataURL('image/png', 0.1) : null;
      
      const noteData = {
        title: title.trim(),
        content: JSON.stringify(canvasData),
        thumbnail,
        last_modified: new Date().toISOString(),
        notebook: currentNote?.notebook || getNotebookFromUrl(),
        canvas_width: 1024,
        canvas_height: 768,
        pdf_pages: pdfPages,
        current_page: currentPage,
        background_pdf: pdfPages.length > 0 ? pdfPages[0] : null
      };

      if (currentNote) {
        await Note.update(currentNote.id, noteData);
      } else {
        const newNote = await Note.create(noteData);
        setCurrentNote(newNote);
      }
      
      setHasUnsavedChanges(false);
      navigate(createPageUrl("Notes"));
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  //#############################################################
  //Change to direct api calls//
  //#############################################################

  const handlePdfUpload = async (file) => {
    try {
      // Upload the PDF file
      const { file_url } = await UploadFile({ file });
      
      // Use LLM to convert PDF pages to images
      const result = await InvokeLLM({
        prompt: `Convert this PDF into individual page images. Return an array of image URLs, one for each page.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: { type: "string" }
            },
            total_pages: { type: "number" }
          }
        }
      });

      if (result.pages && result.pages.length > 0) {
        setPdfPages(result.pages);
        setCurrentPage(0);
        setBackgroundImage(result.pages[0]);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw error;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pdfPages.length) {
      setCurrentPage(newPage);
      setBackgroundImage(pdfPages[newPage]);
      
      // Filter canvas data for current page
      const pageCanvasData = canvasData.filter(path => 
        (path.page === undefined && newPage === 0) || path.page === newPage
      );
      // Note: We don't setCanvasData here to preserve all annotations
      // The canvas component will filter based on currentPage
    }
  };

  //#############################################################
  //Change to direct api calls//
  //#############################################################
  const handleExportToDrive = async () => {
    setIsExporting(true);
    try {
      if (!canvasRef.current) throw new Error("Canvas not available");

      // Get the composite canvas as blob
      const blob = await canvasRef.current.getCanvasAsBlob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = reader.result.split(',')[1];
          
          // Use LLM integration to save to Google Drive as PDF
          const result = await InvokeLLM({
            prompt: `Save this annotated note as a PDF to Google Drive. The image contains handwritten annotations over a document background. Create a high-quality PDF with the title "${currentNote?.title || 'Untitled Note'}" and return the Google Drive link.`,
            file_urls: [`data:image/png;base64,${base64data}`],
            response_json_schema: {
              type: "object",
              properties: {
                drive_url: { type: "string" },
                file_id: { type: "string" },
                success: { type: "boolean" }
              }
            }
          });

          if (result.success && result.drive_url) {
            // Open the Google Drive link
            window.open(result.drive_url, '_blank');
          } else {
            throw new Error("Failed to export to Google Drive");
          }
        } catch (error) {
          console.error("Error exporting to Drive:", error);
          // Fallback: download as image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentNote?.title || 'note'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCanvasChange = (newData) => {
    setCanvasData(newData);
    setHasUnsavedChanges(true);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, canvasData]);
      setCanvasData(lastState);
      setUndoStack(prev => prev.slice(0, -1));
      setHasUnsavedChanges(true);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, canvasData]);
      setCanvasData(nextState);
      setRedoStack(prev => prev.slice(0, -1));
      setHasUnsavedChanges(true);
    }
  };

  const clearCanvas = () => {
    // Only clear annotations for current page
    const otherPagesData = canvasData.filter(path => 
      path.page !== undefined && path.page !== currentPage
    );
    
    setUndoStack(prev => [...prev, canvasData]);
    setRedoStack([]);
    setCanvasData(otherPagesData);
    setHasUnsavedChanges(true);
  };

  // Filter canvas data for current page
  const currentPageData = canvasData.filter(path => 
    (path.page === undefined && currentPage === 0) || path.page === currentPage
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
        <div className="text-center">
          <Book className="w-20 h-20 text-primary-green animate-pulse mb-4 mx-auto" />
          <p className="text-stone-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 overflow-hidden">
      <CanvasHeader
        currentNote={currentNote}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        isExporting={isExporting}
        onSave={saveNote}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        scale={scale}
        onScaleChange={setScale}
        onPdfUpload={handlePdfUpload}
        onExportToDrive={handleExportToDrive}
        currentPage={currentPage}
        totalPages={pdfPages.length}
        onPageChange={handlePageChange}
      />
      
      <div className="flex-1 relative overflow-hidden">
        <DrawingCanvas
          ref={canvasRef}
          canvasData={currentPageData}
          onCanvasChange={handleCanvasChange}
          currentTool={currentTool}
          currentColor={currentColor}
          currentSize={currentSize}
          isDrawing={isDrawing}
          onDrawingChange={setIsDrawing}
          scale={scale}
          panX={panX}
          panY={panY}
          onPanChange={(x, y) => {
            setPanX(x);
            setPanY(y);
          }}
          onAddToUndoStack={() => {
            setUndoStack(prev => [...prev, canvasData]);
            setRedoStack([]);
          }}
          backgroundImage={backgroundImage}
          currentPage={currentPage}
        />
        
        <ToolPalette
          currentTool={currentTool}
          currentColor={currentColor}
          currentSize={currentSize}
          onToolChange={setCurrentTool}
          onColorChange={setCurrentColor}
          onSizeChange={(newSize) => {
            console.log('Size changed to:', newSize); // For debugging
            setCurrentSize(newSize);
          }}
        />
      </div>
    </div>
  );
}