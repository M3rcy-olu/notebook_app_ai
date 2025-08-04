
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";

const DrawingCanvas = forwardRef(({ 
  canvasData, 
  onCanvasChange, 
  currentTool, 
  currentColor, 
  currentSize,
  isDrawing,
  onDrawingChange,
  scale,
  panX,
  panY,
  onPanChange,
  onAddToUndoStack,
  backgroundImage,
  currentPage
}, ref) => {
  const canvasRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [backgroundCtx, setBackgroundCtx] = useState(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [backgroundImg, setBackgroundImg] = useState(null);

  useImperativeHandle(ref, () => ({
    canvas: canvasRef.current,
    backgroundCanvas: backgroundCanvasRef.current,
    getCanvasAsBlob: () => {
      return new Promise((resolve) => {
        // Create a composite canvas with background and annotations
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = 1024;
        compositeCanvas.height = 768;
        const compositeCtx = compositeCanvas.getContext('2d');

        // Draw background if exists
        if (backgroundCanvasRef.current) {
          compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
        }

        // Draw annotations
        if (canvasRef.current) {
          compositeCtx.drawImage(canvasRef.current, 0, 0);
        }

        compositeCanvas.toBlob(resolve, 'image/png');
      });
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;

    const context = canvas.getContext('2d');
    const bgContext = backgroundCanvas.getContext('2d');
    
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.imageSmoothingEnabled = true;
    
    bgContext.imageSmoothingEnabled = true;
    
    setCtx(context);
    setBackgroundCtx(bgContext);

    // Set canvas size
    canvas.width = 1024;
    canvas.height = 768;
    backgroundCanvas.width = 1024;
    backgroundCanvas.height = 768;

    redrawCanvas();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [canvasData, scale, panX, panY]);

  useEffect(() => {
    if (backgroundImage && backgroundCtx) {
      const img = new Image();
      img.onload = () => {
        setBackgroundImg(img);
        drawBackground(img);
      };
      img.src = backgroundImage;
    } else if (backgroundCtx) {
      backgroundCtx.clearRect(0, 0, 1024, 768);
      setBackgroundImg(null);
    }
  }, [backgroundImage, backgroundCtx, currentPage]);

  const drawBackground = (img) => {
    if (!backgroundCtx || !img) return;

    backgroundCtx.clearRect(0, 0, 1024, 768);
    
    // Calculate scaling to fit the image within canvas while maintaining aspect ratio
    const canvasAspect = 1024 / 768;
    const imageAspect = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas aspect ratio
      drawWidth = 1024;
      drawHeight = 1024 / imageAspect;
      offsetX = 0;
      offsetY = (768 - drawHeight) / 2;
    } else {
      // Image is taller than canvas aspect ratio
      drawWidth = 768 * imageAspect;
      drawHeight = 768;
      offsetX = (1024 - drawWidth) / 2;
      offsetY = 0;
    }
    
    backgroundCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  const redrawCanvas = () => {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 1024, 768);
    
    // Save context state
    ctx.save();
    
    // Apply transformations
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    // Draw all paths
    canvasData.forEach(path => {
      drawPath(path);
    });

    // Restore context state
    ctx.restore();
  };

  const drawPath = (path) => {
    if (!ctx || !path.points || path.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.globalCompositeOperation = path.tool === 'eraser' ? 'destination-out' : 'source-over';
    
    // Set opacity for highlighter
    if (path.tool === 'highlighter') {
      ctx.globalAlpha = 0.4;
    } else {
      ctx.globalAlpha = 1;
    }

    const [firstPoint, ...restPoints] = path.points;
    ctx.moveTo(firstPoint.x, firstPoint.y);

    restPoints.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });

    ctx.stroke();
    ctx.globalAlpha = 1; // Reset alpha
  };

  const getPointerPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get the actual pointer position relative to canvas
    const x = (e.clientX - rect.left) / scale - panX / scale;
    const y = (e.clientY - rect.top) / scale - panY / scale;
    
    return { x, y };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsPointerDown(true);
    
    const pos = getPointerPosition(e);
    
    if (currentTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else {
      onDrawingChange(true);
      onAddToUndoStack();
      setCurrentPath([pos]);
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    
    if (!isPointerDown) return;

    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      onPanChange(panX + deltaX, panY + deltaY);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (currentTool !== 'pan') {
      const pos = getPointerPosition(e);
      const newPath = [...currentPath, pos];
      setCurrentPath(newPath);

      // Draw current path in real-time
      if (ctx && newPath.length > 1) {
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(scale, scale);
        
        ctx.beginPath();
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
        
        // Set opacity for highlighter
        if (currentTool === 'highlighter') {
          ctx.globalAlpha = 0.4;
        }
        
        const lastPoint = newPath[newPath.length - 2];
        const currentPoint = newPath[newPath.length - 1];
        
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        
        ctx.restore();
      }
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    setIsPointerDown(false);
    setIsPanning(false);
    
    if (currentPath.length > 1) {
      const newPath = {
        points: currentPath,
        color: currentColor,
        size: currentSize,
        tool: currentTool,
        page: currentPage || 0
      };
      
      const newCanvasData = [...canvasData, newPath];
      onCanvasChange(newCanvasData);
      setCurrentPath([]);
      onDrawingChange(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ paddingLeft: '352px' }}>
      <div className="relative w-full h-full">
        {/* Background Canvas */}
        <canvas
          ref={backgroundCanvasRef}
          className="absolute inset-0 shadow-2xl rounded-2xl mx-4 my-4"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '1024px',
            maxHeight: '768px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            backgroundColor: 'var(--bg-primary)'
          }}
        />
        
        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-2xl mx-4 my-4 cursor-crosshair"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '1024px',
            maxHeight: '768px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            touchAction: 'none',
            zIndex: 2
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
