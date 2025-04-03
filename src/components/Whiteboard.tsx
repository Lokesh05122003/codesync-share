
import { useRef, useEffect, useState } from 'react';
import { Square, Circle, Pencil, Eraser, MousePointer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  broadcastWhiteboardUpdate,
  subscribeToWhiteboardUpdates
} from '@/services/collaborationService';

interface WhiteboardProps {
  roomId: string;
  userName: string;
}

type DrawingTool = 'select' | 'pencil' | 'rectangle' | 'circle' | 'eraser';

const Whiteboard = ({ roomId, userName }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawingTool>('pencil');
  const [color, setColor] = useState('#000000');
  const [drawingData, setDrawingData] = useState<any[]>([]);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to its container's size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = 2;
    contextRef.current = context;
    
    // Clear canvas with white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Handle window resize
    const handleResize = () => {
      if (!canvas || !context) return;
      
      // Save current drawing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Resize
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Restore context properties
      context.lineCap = 'round';
      context.strokeStyle = color;
      context.lineWidth = 2;
      
      // Clear canvas with white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Restore drawing
      context.putImageData(imageData, 0, 0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [color]);

  // Subscribe to whiteboard updates from other users
  useEffect(() => {
    if (!roomId) return;
    
    const unsubscribe = subscribeToWhiteboardUpdates(roomId, (data) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;
      
      switch (data.action) {
        case 'draw':
          context.strokeStyle = data.color;
          context.beginPath();
          context.moveTo(data.startX, data.startY);
          context.lineTo(data.endX, data.endY);
          context.stroke();
          break;
        case 'rectangle':
          context.strokeStyle = data.color;
          context.beginPath();
          context.rect(data.startX, data.startY, data.width, data.height);
          context.stroke();
          break;
        case 'circle':
          context.strokeStyle = data.color;
          context.beginPath();
          context.arc(data.centerX, data.centerY, data.radius, 0, 2 * Math.PI);
          context.stroke();
          break;
        case 'clear':
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          break;
        default:
          break;
      }
    });
    
    return () => unsubscribe();
  }, [roomId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contextRef.current.strokeStyle = color;
    
    setStartPos({ x, y });
    
    if (tool === 'pencil' || tool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && !startPos) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pencil') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
      
      // Broadcast to other users
      broadcastWhiteboardUpdate(roomId, {
        action: 'draw',
        startX: startPos?.x || 0,
        startY: startPos?.y || 0,
        endX: x,
        endY: y,
        color
      });
      
      setStartPos({ x, y });
    } else if (tool === 'eraser') {
      const eraserSize = 20;
      contextRef.current.save();
      contextRef.current.fillStyle = '#ffffff';
      contextRef.current.beginPath();
      contextRef.current.arc(x, y, eraserSize, 0, 2 * Math.PI);
      contextRef.current.fill();
      contextRef.current.restore();
      
      // Broadcast eraser action
      broadcastWhiteboardUpdate(roomId, {
        action: 'draw',
        startX: x - eraserSize,
        startY: y - eraserSize,
        endX: x + eraserSize,
        endY: y + eraserSize,
        color: '#ffffff'
      });
    }
  };

  const finishDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current || !startPos) {
      setIsDrawing(false);
      setStartPos(null);
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    if (tool === 'pencil' || tool === 'eraser') {
      contextRef.current.closePath();
      setIsDrawing(false);
    } else if (tool === 'rectangle') {
      const width = endX - startPos.x;
      const height = endY - startPos.y;
      
      contextRef.current.beginPath();
      contextRef.current.rect(startPos.x, startPos.y, width, height);
      contextRef.current.stroke();
      
      // Broadcast to other users
      broadcastWhiteboardUpdate(roomId, {
        action: 'rectangle',
        startX: startPos.x,
        startY: startPos.y,
        width,
        height,
        color
      });
    } else if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(endX - startPos.x, 2) + Math.pow(endY - startPos.y, 2)
      );
      
      contextRef.current.beginPath();
      contextRef.current.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      contextRef.current.stroke();
      
      // Broadcast to other users
      broadcastWhiteboardUpdate(roomId, {
        action: 'circle',
        centerX: startPos.x,
        centerY: startPos.y,
        radius,
        color
      });
    }
    
    setStartPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    if (!canvas || !context) return;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Broadcast clear action
    broadcastWhiteboardUpdate(roomId, {
      action: 'clear'
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-900">
      <div className="p-2 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={tool === 'select' ? 'default' : 'outline'}
            onClick={() => setTool('select')}
            className="w-8 h-8 p-0"
          >
            <MousePointer size={16} />
          </Button>
          <Button
            size="sm"
            variant={tool === 'pencil' ? 'default' : 'outline'}
            onClick={() => setTool('pencil')}
            className="w-8 h-8 p-0"
          >
            <Pencil size={16} />
          </Button>
          <Button
            size="sm"
            variant={tool === 'rectangle' ? 'default' : 'outline'}
            onClick={() => setTool('rectangle')}
            className="w-8 h-8 p-0"
          >
            <Square size={16} />
          </Button>
          <Button
            size="sm"
            variant={tool === 'circle' ? 'default' : 'outline'}
            onClick={() => setTool('circle')}
            className="w-8 h-8 p-0"
          >
            <Circle size={16} />
          </Button>
          <Button
            size="sm"
            variant={tool === 'eraser' ? 'default' : 'outline'}
            onClick={() => setTool('eraser')}
            className="w-8 h-8 p-0"
          >
            <Eraser size={16} />
          </Button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border-none rounded cursor-pointer"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={clearCanvas}
          className="w-8 h-8 p-0"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <div className="flex-grow relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseLeave={() => {
            if (isDrawing) {
              finishDrawing({ clientX: 0, clientY: 0 } as any);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
