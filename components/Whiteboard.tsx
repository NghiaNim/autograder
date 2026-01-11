"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string; width: number };

interface WhiteboardProps {
  onExport: (imageDataUrl: string, strokes: Stroke[]) => void;
  disabled?: boolean;
}

export function Whiteboard({ onExport, disabled }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    if (disabled) return;
    e.preventDefault();
    setIsDrawing(true);
    setCurrentStroke([getPos(e)]);
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const pos = getPos(e);
    setCurrentStroke((prev) => [...prev, pos]);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const points = [...currentStroke, pos];

    if (points.length >= 2) {
      ctx.strokeStyle = tool === "eraser" ? "#fff" : "#1c1917";
      ctx.lineWidth = tool === "eraser" ? 30 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }

  function handleEnd() {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: tool === "eraser" ? "#fff" : "#1c1917",
        width: tool === "eraser" ? 30 : 3,
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    setCurrentStroke([]);
  }

  function handleClear() {
    setStrokes([]);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function handleExport() {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");
    onExport(dataUrl, strokes);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTool("pen")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg transition-colors",
            tool === "pen"
              ? "bg-surface-900 text-white"
              : "bg-surface-100 text-surface-800 hover:bg-surface-200"
          )}
        >
          ✏️ Pen
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={cn(
            "px-3 py-1.5 text-sm rounded-lg transition-colors",
            tool === "eraser"
              ? "bg-surface-900 text-white"
              : "bg-surface-100 text-surface-800 hover:bg-surface-200"
          )}
        >
          🧹 Eraser
        </button>
        <div className="flex-1" />
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-sm bg-surface-100 text-surface-800 rounded-lg hover:bg-surface-200 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleExport}
          disabled={disabled}
          className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className={cn(
          "w-full aspect-[8/5] bg-white rounded-lg border-2 border-surface-200 whiteboard-canvas",
          tool === "eraser" && "erasing",
          disabled && "opacity-50 pointer-events-none"
        )}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
